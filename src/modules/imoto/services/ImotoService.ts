import { BaseService } from '@/shared/services/base/BaseService'
import { NotificationService } from '@/shared/services/NotificationService'
import { WORKFLOW_STATUS } from '@/shared/workflow/WorkflowTypes'
import { WorkflowService } from '@/shared/workflow/WorkflowService'
import { IMOTO_STORAGE } from '@/modules/imoto/models/imotoModels'
import { imotoRepository } from '@/modules/imoto/repository/ImotoRepository'
import type {
  ImotoActor,
  ImotoLevantamento,
  ImotoLevantamentoForm,
  ImotoSegment,
} from '@/modules/imoto/types/imotoTypes'
import {
  appendTimeline,
  buildCodigo,
  createTimelineEvent,
  makeId,
  nowIso,
} from '@/modules/imoto/utils/imotoUtils'

const baseService = new BaseService<ImotoLevantamento>(imotoRepository)

const persistLocal = (value: ImotoLevantamento[]) => {
  localStorage.setItem(IMOTO_STORAGE.cacheLevantamentos, JSON.stringify(value))
}

const readLocal = (): ImotoLevantamento[] => {
  const raw = localStorage.getItem(IMOTO_STORAGE.cacheLevantamentos)
  if (!raw) return []
  try {
    return JSON.parse(raw) as ImotoLevantamento[]
  } catch {
    return []
  }
}

const resolveWorkflowType = (segment: ImotoSegment): 'I' | 'T' => {
  return segment === 'FABRICA_RACOES' ? 'I' : 'T'
}

export const ImotoService = {
  async list(): Promise<ImotoLevantamento[]> {
    const remote = await baseService.list()
    if (remote.length > 0) {
      persistLocal(remote)
      return remote
    }

    return readLocal()
  },

  async create(payload: ImotoLevantamentoForm, actor: ImotoActor): Promise<ImotoLevantamento> {
    const current = await this.list()
    const timeline = [
      createTimelineEvent('CRIADO', 'Levantamento criado no modulo IMOTO.', actor, payload.status, null),
    ]

    const workflowTipo = resolveWorkflowType(payload.segmento)
    const baseData: Omit<ImotoLevantamento, 'id' | 'createdAt' | 'updatedAt'> = {
      codigo: buildCodigo(current),
      clienteNome: payload.clienteNome,
      unidadeIndustrial: payload.unidadeIndustrial,
      responsavelTecnico: payload.responsavelTecnico,
      segmento: payload.segmento,
      status: payload.status,
      observacoes: payload.observacoes,
      gpsLat: payload.gpsLat,
      gpsLng: payload.gpsLng,
      questionnaire: payload.questionnaire,
      fotos: payload.fotos,
      videos: payload.videos,
      pdfs: payload.pdfs,
      dwgs: payload.dwgs,
      dxfs: payload.dxfs,
      kmzs: payload.kmzs,
      workflowTipo,
      createdBy: actor.id,
      updatedBy: actor.id,
      timeline,
    }

    const fallbackCreated: ImotoLevantamento = {
      id: makeId(),
      ...baseData,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }

    let created: ImotoLevantamento = fallbackCreated

    try {
      created = await baseService.create(baseData)
    } catch {
      created = fallbackCreated
    }

    persistLocal([created, ...current])

    await WorkflowService.ensureWorkflow({
      projetoId: created.id,
      tipo: created.workflowTipo,
      actor,
      initialStatus: WORKFLOW_STATUS.LEVANTAMENTO,
      codigoOficial: created.codigo,
    })

    await WorkflowService.upsertOperationalStage({
      projetoId: created.id,
      tipo: created.workflowTipo,
      actor,
      status: WORKFLOW_STATUS.LEVANTAMENTO,
      responsavel: created.responsavelTecnico,
      prazo: created.updatedAt,
      comentario: created.observacoes || 'Levantamento IMOTO registrado.',
      checklist: [
        { label: 'Questionario segmentado preenchido', done: Object.keys(created.questionnaire).length > 0 },
        { label: 'Coordenadas GPS informadas', done: Boolean(created.gpsLat && created.gpsLng) },
      ],
    })

    NotificationService.create(
      'success',
      'Levantamento criado',
      `${created.codigo} criado para o segmento ${created.segmento}.`
    )

    return created
  },

  async update(id: string, payload: ImotoLevantamentoForm, actor: ImotoActor): Promise<ImotoLevantamento> {
    const current = await this.list()
    const found = current.find((item) => item.id === id)
    if (!found) throw new Error('Levantamento IMOTO nao encontrado')

    const updated: ImotoLevantamento = {
      ...found,
      ...payload,
      workflowTipo: resolveWorkflowType(payload.segmento),
      updatedBy: actor.id,
      timeline: appendTimeline(
        found.id,
        found.codigo,
        found.timeline,
        createTimelineEvent('ATUALIZADO', 'Levantamento atualizado.', actor, payload.status, found.status)
      ),
      updatedAt: nowIso(),
    }

    const changes = { ...updated }
    delete (changes as { id?: string }).id

    try {
      await baseService.update(id, changes)
    } catch {
      // Mantem continuidade local quando Firestore esta indisponivel.
    }

    persistLocal(current.map((item) => (item.id === id ? updated : item)))

    NotificationService.create('info', 'Levantamento atualizado', `${updated.codigo} atualizado.`)

    await WorkflowService.upsertOperationalStage({
      projetoId: updated.id,
      tipo: updated.workflowTipo,
      actor,
      status: WORKFLOW_STATUS.LEVANTAMENTO,
      responsavel: updated.responsavelTecnico,
      prazo: updated.updatedAt,
      comentario: 'Levantamento IMOTO atualizado.',
    })

    return updated
  },

  async remove(id: string): Promise<void> {
    const current = await this.list()
    const found = current.find((item) => item.id === id)
    const next = current.filter((item) => item.id !== id)

    try {
      await baseService.remove(id)
    } catch {
      // Mantem continuidade local quando Firestore esta indisponivel.
    }

    persistLocal(next)

    if (found) {
      NotificationService.create('warning', 'Levantamento removido', `${found.codigo} removido.`)
    }
  },

  async sendToEngineering(id: string, actor: ImotoActor): Promise<ImotoLevantamento> {
    const current = await this.list()
    const found = current.find((item) => item.id === id)
    if (!found) throw new Error('Levantamento IMOTO nao encontrado')

    const updated: ImotoLevantamento = {
      ...found,
      status: 'ENVIADO',
      updatedBy: actor.id,
      timeline: appendTimeline(
        found.id,
        found.codigo,
        found.timeline,
        createTimelineEvent(
          'ENVIADO_ENGENHARIA',
          'Levantamento enviado para Engenharia.',
          actor,
          'ENVIADO',
          found.status
        )
      ),
      updatedAt: nowIso(),
    }

    const changes = { ...updated }
    delete (changes as { id?: string }).id

    try {
      await baseService.update(id, changes)
    } catch {
      // Mantem continuidade local quando Firestore esta indisponivel.
    }

    persistLocal(current.map((item) => (item.id === id ? updated : item)))

    await WorkflowService.transitionStatus({
      projetoId: updated.id,
      tipo: updated.workflowTipo,
      actor,
      toStatus: WORKFLOW_STATUS.AGUARDANDO_ENGENHARIA,
      acao: 'ENVIO_ENGENHARIA',
      observacao: 'Levantamento IMOTO enviado para Engenharia.',
      codigoOficial: updated.codigo,
    })

    await WorkflowService.upsertOperationalStage({
      projetoId: updated.id,
      tipo: updated.workflowTipo,
      actor,
      status: WORKFLOW_STATUS.AGUARDANDO_ENGENHARIA,
      responsavel: actor.name,
      prazo: updated.updatedAt,
      comentario: 'Aguardando inicio de projeto na Engenharia.',
      checklist: [
        { label: 'Levantamento validado', done: true },
        { label: 'Pacote de arquivos enviado', done: true },
      ],
    })

    NotificationService.create(
      'info',
      'Envio para Engenharia',
      `${updated.codigo} enviado para fluxo de Engenharia.`
    )

    return updated
  },

  saveDraft(data: ImotoLevantamentoForm) {
    localStorage.setItem(IMOTO_STORAGE.draftForm, JSON.stringify(data))
  },

  loadDraft(): ImotoLevantamentoForm | null {
    const raw = localStorage.getItem(IMOTO_STORAGE.draftForm)
    if (!raw) return null
    try {
      return JSON.parse(raw) as ImotoLevantamentoForm
    } catch {
      return null
    }
  },

  clearDraft() {
    localStorage.removeItem(IMOTO_STORAGE.draftForm)
  },
}
