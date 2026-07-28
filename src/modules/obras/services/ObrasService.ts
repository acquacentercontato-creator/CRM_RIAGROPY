import { BaseService } from '@/shared/services/base/BaseService'
import { NotificationService } from '@/shared/services/NotificationService'
import { ProjetoService } from '@/shared/services/ProjetoService'
import { TimelineService } from '@/shared/services/TimelineService'
import { WORKFLOW_STATUS } from '@/shared/workflow/WorkflowTypes'
import { WorkflowService } from '@/shared/workflow/WorkflowService'
import { OBRAS_STORAGE } from '@/modules/obras/models/obrasModels'
import { obrasRepository } from '@/modules/obras/repositories/ObrasRepository'
import { ObrasStorageService } from '@/modules/obras/services/ObrasStorageService'
import type {
  Obra,
  ObraActor,
  ObraFiles,
  ObraForm,
  ObraStatus,
  ObrasUploadCategory,
} from '@/modules/obras/types/obrasTypes'
import {
  buildCodigoObra,
  createTimelineEvent,
  makeId,
  mapObraStatusToWorkflow,
  nowIso,
} from '@/modules/obras/utils/obrasUtils'

const baseService = new BaseService<Obra>(obrasRepository)

const persistLocal = (value: Obra[]) => {
  localStorage.setItem(OBRAS_STORAGE.cacheObras, JSON.stringify(value))
}

const readLocal = (): Obra[] => {
  const raw = localStorage.getItem(OBRAS_STORAGE.cacheObras)
  if (!raw) return []

  try {
    return JSON.parse(raw) as Obra[]
  } catch {
    return []
  }
}

const toChanges = (value: Obra): Partial<Omit<Obra, 'id'>> => {
  const copy = { ...value }
  delete (copy as { id?: string }).id
  return copy
}

const appendTimeline = (
  obra: Obra,
  actor: ObraActor,
  type: string,
  message: string,
  nextStatus?: string,
  previousStatus?: string | null
): Obra => {
  const event = createTimelineEvent(type, message, actor, nextStatus, previousStatus)
  const merged = TimelineService.append(obra.id, obra.codigoObra, event)

  return {
    ...obra,
    timeline: merged,
    updatedAt: nowIso(),
    updatedBy: actor.id,
  }
}

const saveOrMerge = (rows: Obra[], obra: Obra): Obra[] => {
  const exists = rows.some((item) => item.id === obra.id)
  const next = exists ? rows.map((item) => (item.id === obra.id ? obra : item)) : [obra, ...rows]
  persistLocal(next)
  return next
}

const syncProjectWorkflow = async (obra: Obra, actor: ObraActor) => {
  if (!obra.projetoId) return

  try {
    await ProjetoService.transitionWorkflowStatus(
      obra.projetoId,
      actor,
      obra.projetoTipo,
      mapObraStatusToWorkflow(obra.status),
      `Obra ${obra.codigoObra} atualizada para ${obra.status}`
    )
  } catch {
    // Em caso de bloqueio de fluxo, a obra continua persistida local/remota.
  }
}

export const ObrasService = {
  async list(): Promise<Obra[]> {
    const remote = await baseService.list()
    if (remote.length > 0) {
      const synced = remote.map((item) => ({
        ...item,
        timeline: TimelineService.merge(item.id, item.codigoObra, item.timeline),
      }))
      persistLocal(synced)
      return synced
    }

    return readLocal()
  },

  async create(payload: ObraForm, actor: ObraActor): Promise<Obra> {
    const current = await this.list()

    const baseData: Omit<Obra, 'id' | 'createdAt' | 'updatedAt'> = {
      codigoObra: buildCodigoObra(current),
      clienteNome: payload.clienteNome,
      projetoId: payload.projetoId,
      projetoNome: payload.projetoNome,
      projetoTipo: payload.projetoTipo,
      responsavelObra: payload.responsavelObra,
      status: 'OBRA_CRIADA',
      dataCriacaoObra: payload.dataCriacaoObra,
      dataInicio: payload.dataInicio,
      dataPrevista: payload.dataPrevista,
      dataEntrega: payload.dataEntrega,
      prioridade: payload.prioridade,
      observacoesPlanejamento: payload.observacoesPlanejamento,
      equipes: payload.equipes,
      cronograma: payload.cronograma,
      diarioObra: payload.diarioObra,
      checklist: payload.checklist,
      entregaTecnica: payload.entregaTecnica,
      fotos: payload.fotos,
      videos: payload.videos,
      documentos: payload.documentos,
      pdfs: payload.pdfs,
      createdBy: actor.id,
      updatedBy: actor.id,
      timeline: [],
    }

    const fallbackCreated: Obra = {
      id: makeId(),
      ...baseData,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }

    let created = fallbackCreated

    try {
      created = await baseService.create(baseData)
    } catch {
      created = fallbackCreated
    }

    created = appendTimeline(
      created,
      actor,
      'OBRA_CRIADA',
      'Obra criada a partir de projeto aprovado.',
      created.status,
      null
    )

    saveOrMerge(current, created)

    await WorkflowService.ensureWorkflow({
      projetoId: created.id,
      tipo: created.projetoTipo,
      actor,
      initialStatus: WORKFLOW_STATUS.OBRA,
      codigoOficial: created.codigoObra,
    })

    await WorkflowService.upsertOperationalStage({
      projetoId: created.id,
      tipo: created.projetoTipo,
      actor,
      status: WORKFLOW_STATUS.OBRA,
      responsavel: created.responsavelObra,
      prazo: created.dataPrevista || created.updatedAt,
      comentario: created.observacoesPlanejamento || 'Obra criada a partir de projeto aprovado.',
      checklist: [
        { label: 'Cadastro inicial concluido', done: true },
        { label: 'Planejamento com data prevista', done: Boolean(created.dataPrevista) },
      ],
    })

    await syncProjectWorkflow(created, actor)

    try {
      await baseService.update(created.id, toChanges(created))
    } catch {
      // fallback local ativo
    }

    NotificationService.create('success', 'Obra criada', `${created.codigoObra} cadastrada com sucesso.`)

    return created
  },

  async update(id: string, payload: ObraForm, actor: ObraActor): Promise<Obra> {
    const current = await this.list()
    const found = current.find((item) => item.id === id)
    if (!found) throw new Error('Obra nao encontrada')

    let updated: Obra = {
      ...found,
      ...payload,
      updatedBy: actor.id,
      updatedAt: nowIso(),
    }

    updated = appendTimeline(updated, actor, 'OBRA_ATUALIZADA', 'Dados da obra atualizados.', updated.status, found.status)

    try {
      await baseService.update(id, toChanges(updated))
    } catch {
      // fallback local ativo
    }

    saveOrMerge(current, updated)

    await WorkflowService.upsertOperationalStage({
      projetoId: updated.id,
      tipo: updated.projetoTipo,
      actor,
      status: mapObraStatusToWorkflow(updated.status),
      responsavel: updated.responsavelObra,
      prazo: updated.dataPrevista || updated.updatedAt,
      comentario: 'Cadastro da obra atualizado.',
    })

    if (found.status !== updated.status) {
      await this.changeStatus(id, updated.status, actor, 'Status alterado por atualizacao de cadastro')
    }

    NotificationService.create('info', 'Obra atualizada', `${updated.codigoObra} atualizada.`)

    return updated
  },

  async remove(id: string): Promise<void> {
    const current = await this.list()
    const found = current.find((item) => item.id === id)

    try {
      await baseService.remove(id)
    } catch {
      // fallback local ativo
    }

    persistLocal(current.filter((item) => item.id !== id))

    if (found) {
      NotificationService.create('warning', 'Obra removida', `${found.codigoObra} removida do cadastro.`)
    }
  },

  async changeStatus(id: string, status: ObraStatus, actor: ObraActor, observacao?: string): Promise<Obra> {
    const current = await this.list()
    const found = current.find((item) => item.id === id)
    if (!found) throw new Error('Obra nao encontrada')

    let updated: Obra = {
      ...found,
      status,
      updatedBy: actor.id,
      updatedAt: nowIso(),
    }

    updated = appendTimeline(
      updated,
      actor,
      'STATUS_OBRA_ALTERADO',
      `Status da obra alterado para ${status}.`,
      status,
      found.status
    )

    try {
      await WorkflowService.transitionStatus({
        projetoId: updated.id,
        tipo: updated.projetoTipo,
        actor,
        toStatus: mapObraStatusToWorkflow(status),
        observacao: observacao ?? `Fluxo da obra em ${status}`,
        codigoOficial: updated.codigoObra,
      })
    } catch {
      // transicao pode ser rejeitada por sequencia; estado local permanece consistente
    }

    await syncProjectWorkflow(updated, actor)

    try {
      await baseService.update(id, toChanges(updated))
    } catch {
      // fallback local ativo
    }

    saveOrMerge(current, updated)

    await WorkflowService.upsertOperationalStage({
      projetoId: updated.id,
      tipo: updated.projetoTipo,
      actor,
      status: mapObraStatusToWorkflow(updated.status),
      responsavel: updated.responsavelObra,
      prazo: updated.dataPrevista || updated.updatedAt,
      comentario: observacao ?? `Status da obra em ${status}`,
      checklist: [
        {
          label: 'Checklist de campo atualizado',
          done: Object.values(updated.checklist).some((item) => Boolean(item)),
        },
      ],
    })

    return updated
  },

  async uploadFiles(id: string, category: ObrasUploadCategory, files: File[], actor: ObraActor): Promise<Obra> {
    const current = await this.list()
    const found = current.find((item) => item.id === id)
    if (!found) throw new Error('Obra nao encontrada')

    const uploaded = await ObrasStorageService.upload(files, category, found.codigoObra)
    const bucket = uploaded.bucket

    let updated: Obra = {
      ...found,
      [bucket]: [...uploaded.files, ...(found[bucket] as ObraFiles[typeof bucket])],
      updatedBy: actor.id,
      updatedAt: nowIso(),
    }

    updated = appendTimeline(
      updated,
      actor,
      'UPLOAD_OBRA',
      `${uploaded.files.length} arquivo(s) enviados em ${category}.`,
      updated.status,
      found.status
    )

    try {
      await baseService.update(id, toChanges(updated))
    } catch {
      // fallback local ativo
    }

    saveOrMerge(current, updated)

    await WorkflowService.upsertOperationalStage({
      projetoId: updated.id,
      tipo: updated.projetoTipo,
      actor,
      status: mapObraStatusToWorkflow(updated.status),
      responsavel: updated.responsavelObra,
      prazo: updated.dataPrevista || updated.updatedAt,
      comentario: `${uploaded.files.length} arquivo(s) adicionados em ${category}.`,
      arquivos: uploaded.files.map((file) => ({
        id: file.id,
        name: file.name,
        url: file.url,
        category,
      })),
    })

    return updated
  },

  saveDraft(data: ObraForm) {
    localStorage.setItem(OBRAS_STORAGE.draftObra, JSON.stringify(data))
  },

  loadDraft(): ObraForm | null {
    const raw = localStorage.getItem(OBRAS_STORAGE.draftObra)
    if (!raw) return null

    try {
      return JSON.parse(raw) as ObraForm
    } catch {
      return null
    }
  },

  clearDraft() {
    localStorage.removeItem(OBRAS_STORAGE.draftObra)
  },
}
