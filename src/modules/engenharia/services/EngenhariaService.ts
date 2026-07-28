import { BaseService } from '@/shared/services/base/BaseService'
import { NotificationService } from '@/shared/services/NotificationService'
import { RevisionService } from '@/shared/services/RevisionService'
import { TimelineService } from '@/shared/services/TimelineService'
import { WORKFLOW_STATUS, type WorkflowStatus } from '@/shared/workflow/WorkflowTypes'
import { WorkflowService } from '@/shared/workflow/WorkflowService'
import { ENGENHARIA_STORAGE } from '@/modules/engenharia/models/engenhariaModels'
import { engenhariaRepository } from '@/modules/engenharia/repository/EngenhariaRepository'
import type {
  EngenhariaActor,
  EngenhariaProject,
  EngenhariaProjectFiles,
  EngenhariaProjectForm,
  EngenhariaStatus,
  EngenhariaUploadCategory,
} from '@/modules/engenharia/types/engenhariaTypes'
import {
  createTimelineEvent,
  makeId,
  mapEngineeringStatusToWorkflow,
  nowIso,
} from '@/modules/engenharia/utils/engenhariaUtils'
import { EngenhariaStorageService } from '@/modules/engenharia/services/EngenhariaStorageService'

const baseService = new BaseService<EngenhariaProject>(engenhariaRepository)

const persistLocal = (value: EngenhariaProject[]) => {
  localStorage.setItem(ENGENHARIA_STORAGE.cacheProjetos, JSON.stringify(value))
}

const readLocal = (): EngenhariaProject[] => {
  const raw = localStorage.getItem(ENGENHARIA_STORAGE.cacheProjetos)
  if (!raw) return []

  try {
    return JSON.parse(raw) as EngenhariaProject[]
  } catch {
    return []
  }
}

const toChanges = (project: EngenhariaProject): Partial<Omit<EngenhariaProject, 'id'>> => {
  const copy = { ...project }
  delete (copy as { id?: string }).id
  return copy
}

const mergeAndPersist = (items: EngenhariaProject[], next: EngenhariaProject) => {
  const updated = items.some((item) => item.id === next.id)
    ? items.map((item) => (item.id === next.id ? next : item))
    : [next, ...items]

  persistLocal(updated)
  return updated
}

const appendTimeline = (
  project: EngenhariaProject,
  actor: EngenhariaActor,
  type: string,
  message: string,
  nextStatus?: string,
  previousStatus?: string | null
): EngenhariaProject => {
  const event = createTimelineEvent(type, message, actor, nextStatus, previousStatus)
  const timeline = TimelineService.append(project.id, project.codigoProjeto, event)

  return {
    ...project,
    timeline,
    updatedBy: actor.id,
    updatedAt: nowIso(),
  }
}

const transitionWorkflowStatus = async (
  project: EngenhariaProject,
  actor: EngenhariaActor,
  target: WorkflowStatus,
  observacao: string
) => {
  await WorkflowService.transitionStatus({
    projetoId: project.id,
    tipo: project.tipoProjeto,
    actor,
    toStatus: target,
    observacao,
    codigoOficial: project.codigoProjeto,
  })
}

export const EngenhariaService = {
  async list(): Promise<EngenhariaProject[]> {
    const remote = await baseService.list()
    if (remote.length > 0) {
      const synced = remote.map((item) => ({
        ...item,
        timeline: TimelineService.merge(item.id, item.codigoProjeto, item.timeline),
      }))
      persistLocal(synced)
      return synced
    }

    return readLocal()
  },

  async create(payload: EngenhariaProjectForm, actor: EngenhariaActor): Promise<EngenhariaProject> {
    const current = await this.list()
    const codigoProjeto = await RevisionService.generateOfficialCode(payload.tipoProjeto)

    const baseData: Omit<EngenhariaProject, 'id' | 'createdAt' | 'updatedAt'> = {
      codigoProjeto,
      clienteNome: payload.clienteNome,
      titulo: payload.titulo,
      tipoProjeto: payload.tipoProjeto,
      origem: payload.origem,
      status: 'AGUARDANDO ENGENHARIA',
      memorialDescritivo: payload.memorialDescritivo,
      revisoes: [codigoProjeto],
      aprovadoGerente: 'PENDENTE',
      workflowStatus: WORKFLOW_STATUS.AGUARDANDO_ENGENHARIA,
      enviadoOrcamento: false,
      observacoes: payload.observacoes,
      plantaPdf: payload.plantaPdf,
      dwg: payload.dwg,
      dxf: payload.dxf,
      kmz: payload.kmz,
      fotos: payload.fotos,
      videos: payload.videos,
      materiais: payload.materiais,
      createdBy: actor.id,
      updatedBy: actor.id,
      timeline: [],
    }

    const fallbackCreated: EngenhariaProject = {
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
      'PROJETO_RECEBIDO',
      'Projeto recebido pela Engenharia.',
      created.status,
      null
    )

    mergeAndPersist(current, created)

    await WorkflowService.ensureWorkflow({
      projetoId: created.id,
      tipo: created.tipoProjeto,
      actor,
      initialStatus: WORKFLOW_STATUS.AGUARDANDO_ENGENHARIA,
      codigoOficial: created.codigoProjeto,
    })

    await WorkflowService.upsertOperationalStage({
      projetoId: created.id,
      tipo: created.tipoProjeto,
      actor,
      status: WORKFLOW_STATUS.AGUARDANDO_ENGENHARIA,
      responsavel: actor.name,
      prazo: created.updatedAt,
      comentario: created.observacoes || 'Projeto aguardando inicio tecnico.',
      checklist: [
        { label: 'Projeto recebido', done: true },
        { label: 'Origem e tipo definidos', done: Boolean(created.origem && created.tipoProjeto) },
      ],
    })

    NotificationService.create(
      'success',
      'Projeto de Engenharia criado',
      `${created.codigoProjeto} criado e aguardando inicio tecnico.`
    )

    try {
      await baseService.update(created.id, toChanges(created))
    } catch {
      // Mantem continuidade local quando Firestore esta indisponivel.
    }

    return created
  },

  async update(id: string, payload: EngenhariaProjectForm, actor: EngenhariaActor): Promise<EngenhariaProject> {
    const current = await this.list()
    const found = current.find((item) => item.id === id)
    if (!found) throw new Error('Projeto de Engenharia nao encontrado')

    let updated: EngenhariaProject = {
      ...found,
      ...payload,
      updatedBy: actor.id,
      updatedAt: nowIso(),
    }

    updated = appendTimeline(updated, actor, 'ATUALIZADO', 'Projeto atualizado.', updated.status, found.status)

    if (updated.status !== found.status) {
      try {
        await transitionWorkflowStatus(
          updated,
          actor,
          mapEngineeringStatusToWorkflow(updated.status),
          `Status alterado durante atualizacao para ${updated.status}`
        )
      } catch {
        // Workflow pode bloquear transicao fora da sequencia; projeto continua consistente localmente.
      }
    }

    try {
      await baseService.update(id, toChanges(updated))
    } catch {
      // Mantem continuidade local quando Firestore esta indisponivel.
    }

    mergeAndPersist(current, updated)

    await WorkflowService.upsertOperationalStage({
      projetoId: updated.id,
      tipo: updated.tipoProjeto,
      actor,
      status: mapEngineeringStatusToWorkflow(updated.status),
      responsavel: actor.name,
      prazo: updated.updatedAt,
      comentario: `Projeto atualizado com status ${updated.status}.`,
    })

    NotificationService.create('info', 'Projeto atualizado', `${updated.codigoProjeto} atualizado.`)

    return updated
  },

  async remove(id: string): Promise<void> {
    const current = await this.list()
    const found = current.find((item) => item.id === id)

    try {
      await baseService.remove(id)
    } catch {
      // Mantem continuidade local quando Firestore esta indisponivel.
    }

    persistLocal(current.filter((item) => item.id !== id))

    if (found) {
      NotificationService.create('warning', 'Projeto removido', `${found.codigoProjeto} removido.`)
    }
  },

  async changeStatus(
    id: string,
    status: EngenhariaStatus,
    actor: EngenhariaActor,
    observation?: string
  ): Promise<EngenhariaProject> {
    const current = await this.list()
    const found = current.find((item) => item.id === id)
    if (!found) throw new Error('Projeto de Engenharia nao encontrado')

    const previous = found.status
    let updated: EngenhariaProject = {
      ...found,
      status,
      workflowStatus: mapEngineeringStatusToWorkflow(status),
      updatedBy: actor.id,
      updatedAt: nowIso(),
    }

    updated = appendTimeline(
      updated,
      actor,
      'STATUS_ALTERADO',
      `Status alterado para ${status}.`,
      status,
      previous
    )

    try {
      await transitionWorkflowStatus(
        updated,
        actor,
        mapEngineeringStatusToWorkflow(status),
        observation ?? `Status de Engenharia alterado para ${status}`
      )
    } catch {
      // Workflow pode bloquear transicao fora da sequencia; projeto continua consistente localmente.
    }

    try {
      await baseService.update(id, toChanges(updated))
    } catch {
      // Mantem continuidade local quando Firestore esta indisponivel.
    }

    mergeAndPersist(current, updated)

    await WorkflowService.upsertOperationalStage({
      projetoId: updated.id,
      tipo: updated.tipoProjeto,
      actor,
      status: mapEngineeringStatusToWorkflow(updated.status),
      responsavel: actor.name,
      prazo: updated.updatedAt,
      comentario: observation ?? `Status alterado para ${status}`,
    })

    return updated
  },

  async createRevision(id: string, actor: EngenhariaActor, motivo: string): Promise<EngenhariaProject> {
    const current = await this.list()
    const found = current.find((item) => item.id === id)
    if (!found) throw new Error('Projeto de Engenharia nao encontrado')

    const nextCode = RevisionService.nextRevision(found.codigoProjeto)
    let updated: EngenhariaProject = {
      ...found,
      codigoProjeto: nextCode,
      revisoes: [...found.revisoes, nextCode],
      status: 'REVISAO',
      workflowStatus: WORKFLOW_STATUS.EM_PROJETO,
      aprovadoGerente: 'REVISAO_SOLICITADA',
      updatedBy: actor.id,
      updatedAt: nowIso(),
    }

    updated = appendTimeline(
      updated,
      actor,
      'REVISAO_CRIADA',
      `Revisao criada (${nextCode}). Motivo: ${motivo}`,
      updated.status,
      found.status
    )

    try {
      await transitionWorkflowStatus(updated, actor, WORKFLOW_STATUS.EM_PROJETO, 'Projeto em revisao tecnica')
    } catch {
      // Workflow pode estar em estado equivalente e rejeitar transicao redundante.
    }

    try {
      await baseService.update(id, toChanges(updated))
    } catch {
      // Mantem continuidade local quando Firestore esta indisponivel.
    }

    mergeAndPersist(current, updated)

    NotificationService.create('warning', 'Nova revisao', `${updated.codigoProjeto} entrou em revisao.`)

    return updated
  },

  async saveMemorial(id: string, memorial: string, actor: EngenhariaActor): Promise<EngenhariaProject> {
    const current = await this.list()
    const found = current.find((item) => item.id === id)
    if (!found) throw new Error('Projeto de Engenharia nao encontrado')

    let updated: EngenhariaProject = {
      ...found,
      memorialDescritivo: memorial,
      status: 'AGUARDANDO MEMORIAL',
      workflowStatus: WORKFLOW_STATUS.AGUARDANDO_MEMORIAL,
      updatedBy: actor.id,
      updatedAt: nowIso(),
    }

    updated = appendTimeline(
      updated,
      actor,
      'MEMORIAL_ATUALIZADO',
      'Memorial descritivo atualizado.',
      updated.status,
      found.status
    )

    try {
      await transitionWorkflowStatus(updated, actor, WORKFLOW_STATUS.AGUARDANDO_MEMORIAL, 'Memorial atualizado')
    } catch {
      // Workflow pode bloquear transicao fora da sequencia; persistencia local continua.
    }

    try {
      await baseService.update(id, toChanges(updated))
    } catch {
      // Mantem continuidade local quando Firestore esta indisponivel.
    }

    mergeAndPersist(current, updated)

    await WorkflowService.upsertOperationalStage({
      projetoId: updated.id,
      tipo: updated.tipoProjeto,
      actor,
      status: WORKFLOW_STATUS.AGUARDANDO_MEMORIAL,
      responsavel: actor.name,
      prazo: updated.updatedAt,
      comentario: 'Memorial atualizado e aguardando consolidacao.',
      checklist: [{ label: 'Memorial descritivo preenchido', done: Boolean(memorial.trim()) }],
    })

    return updated
  },

  async processManagerApproval(
    id: string,
    actor: EngenhariaActor,
    decision: 'APROVAR' | 'SOLICITAR_REVISAO',
    observacao: string
  ): Promise<EngenhariaProject> {
    const current = await this.list()
    const found = current.find((item) => item.id === id)
    if (!found) throw new Error('Projeto de Engenharia nao encontrado')

    await WorkflowService.processManagerApproval({
      projetoId: found.id,
      tipo: found.tipoProjeto,
      actor,
      decision,
      observacao,
    })

    let updated: EngenhariaProject = {
      ...found,
      aprovadoGerente: decision === 'APROVAR' ? 'APROVADO' : 'REVISAO_SOLICITADA',
      status: decision === 'APROVAR' ? 'PROJETO COMPLETO' : 'REVISAO',
      workflowStatus:
        decision === 'APROVAR' ? WORKFLOW_STATUS.PROJETO_COMPLETO : WORKFLOW_STATUS.EM_PROJETO,
      updatedBy: actor.id,
      updatedAt: nowIso(),
    }

    updated = appendTimeline(
      updated,
      actor,
      decision === 'APROVAR' ? 'APROVACAO_GERENTE' : 'SOLICITACAO_REVISAO_GERENTE',
      observacao || (decision === 'APROVAR' ? 'Projeto aprovado pelo gerente.' : 'Revisao solicitada pelo gerente.'),
      updated.status,
      found.status
    )

    try {
      await baseService.update(id, toChanges(updated))
    } catch {
      // Mantem continuidade local quando Firestore esta indisponivel.
    }

    mergeAndPersist(current, updated)

    NotificationService.create(
      decision === 'APROVAR' ? 'success' : 'warning',
      'Aprovacao Gerencial',
      `${updated.codigoProjeto} ${decision === 'APROVAR' ? 'aprovado' : 'retornou para revisao'}.`
    )

    await WorkflowService.upsertOperationalStage({
      projetoId: updated.id,
      tipo: updated.tipoProjeto,
      actor,
      status:
        decision === 'APROVAR' ? WORKFLOW_STATUS.PROJETO_COMPLETO : WORKFLOW_STATUS.EM_PROJETO,
      responsavel: actor.name,
      prazo: updated.updatedAt,
      comentario: observacao,
      checklist: [{ label: 'Aprovacao gerencial registrada', done: true }],
    })

    return updated
  },

  async sendToBudget(id: string, actor: EngenhariaActor): Promise<EngenhariaProject> {
    const current = await this.list()
    const found = current.find((item) => item.id === id)
    if (!found) throw new Error('Projeto de Engenharia nao encontrado')

    let updated: EngenhariaProject = {
      ...found,
      enviadoOrcamento: true,
      updatedBy: actor.id,
      updatedAt: nowIso(),
    }

    updated = appendTimeline(
      updated,
      actor,
      'ENVIADO_ORCAMENTO',
      'Projeto encaminhado para Orcamento.',
      'ORÇAMENTO',
      found.status
    )

    try {
      await transitionWorkflowStatus(updated, actor, WORKFLOW_STATUS.ORCAMENTO, 'Projeto enviado para Orcamento')
    } catch {
      // Workflow pode bloquear por sequencia diferente; flag local continua.
    }

    try {
      await baseService.update(id, toChanges(updated))
    } catch {
      // Mantem continuidade local quando Firestore esta indisponivel.
    }

    mergeAndPersist(current, updated)

    NotificationService.create('info', 'Orcamento', `${updated.codigoProjeto} enviado para Orcamento.`)

    await WorkflowService.upsertOperationalStage({
      projetoId: updated.id,
      tipo: updated.tipoProjeto,
      actor,
      status: WORKFLOW_STATUS.ORCAMENTO,
      responsavel: actor.name,
      prazo: updated.updatedAt,
      comentario: 'Projeto encaminhado para Orcamento.',
      checklist: [
        { label: 'Projeto completo anexado', done: true },
        { label: 'Aprovacao gerencial concluida', done: updated.aprovadoGerente === 'APROVADO' },
      ],
    })

    return updated
  },

  async uploadFiles(
    id: string,
    category: EngenhariaUploadCategory,
    files: File[],
    actor: EngenhariaActor
  ): Promise<EngenhariaProject> {
    const current = await this.list()
    const found = current.find((item) => item.id === id)
    if (!found) throw new Error('Projeto de Engenharia nao encontrado')

    const uploaded = await EngenhariaStorageService.upload(files, category, found.codigoProjeto)
    const bucketKey = uploaded.bucket

    let updated: EngenhariaProject = {
      ...found,
      [bucketKey]: [...uploaded.files, ...(found[bucketKey] as EngenhariaProjectFiles[typeof bucketKey])],
      updatedBy: actor.id,
      updatedAt: nowIso(),
    }

    updated = appendTimeline(
      updated,
      actor,
      'UPLOAD_ARQUIVOS',
      `${uploaded.files.length} arquivo(s) enviados para ${category}.`,
      updated.status,
      found.status
    )

    try {
      await baseService.update(id, toChanges(updated))
    } catch {
      // Mantem continuidade local quando Firestore esta indisponivel.
    }

    mergeAndPersist(current, updated)

    await WorkflowService.upsertOperationalStage({
      projetoId: updated.id,
      tipo: updated.tipoProjeto,
      actor,
      status: mapEngineeringStatusToWorkflow(updated.status),
      responsavel: actor.name,
      prazo: updated.updatedAt,
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

  saveDraft(data: EngenhariaProjectForm) {
    localStorage.setItem(ENGENHARIA_STORAGE.draftProjeto, JSON.stringify(data))
  },

  loadDraft(): EngenhariaProjectForm | null {
    const raw = localStorage.getItem(ENGENHARIA_STORAGE.draftProjeto)
    if (!raw) return null

    try {
      return JSON.parse(raw) as EngenhariaProjectForm
    } catch {
      return null
    }
  },

  clearDraft() {
    localStorage.removeItem(ENGENHARIA_STORAGE.draftProjeto)
  },
}
