import { AuditService } from '@/shared/services/AuditService'
import { CORE_EVENTS, EventBus } from '@/shared/services/EventBus'
import { LoggerService } from '@/shared/services/LoggerService'
import { NotificationService } from '@/shared/services/NotificationService'
import { RevisionService } from '@/shared/services/RevisionService'
import {
  createWorkflowModel,
  createWorkflowTimelineEntry,
  type WorkflowComment,
  type WorkflowFileReference,
  type WorkflowActor,
  type WorkflowModel,
} from '@/shared/workflow/WorkflowModel'
import { WorkflowRepository } from '@/shared/workflow/WorkflowRepository'
import {
  WORKFLOW_DEFAULT_SEQUENCE,
  WORKFLOW_STATUS,
  type WorkflowStatus,
  type WorkflowTypeCode,
} from '@/shared/workflow/WorkflowTypes'
import {
  validateManagerApproval,
  validateWorkflowFlow,
  validateWorkflowTransition,
} from '@/shared/workflow/WorkflowValidators'

const REPOSITORY = new WorkflowRepository()

const toNowIso = () => new Date().toISOString()

const toDefaultDeadline = () => {
  const date = new Date()
  date.setDate(date.getDate() + 7)
  return date.toISOString()
}

const normalizeFlow = (flow?: WorkflowStatus[]) => {
  if (!flow || flow.length === 0) return WORKFLOW_DEFAULT_SEQUENCE
  return flow
}

const normalizeModel = (model: WorkflowModel): WorkflowModel => {
  return {
    ...model,
    etapas: model.etapas ?? {},
  }
}

const ensureTransition = (fromStatus: WorkflowStatus, toStatus: WorkflowStatus) => {
  const check = validateWorkflowTransition(fromStatus, toStatus)
  if (!check.ok) {
    throw new Error(check.reason)
  }
}

const appendTimeline = (
  model: WorkflowModel,
  actor: WorkflowActor,
  acao: string,
  statusNovo: WorkflowStatus,
  observacao?: string
) => {
  const entry = createWorkflowTimelineEntry({
    actor,
    acao,
    statusAnterior: model.status,
    statusNovo,
    observacao,
  })

  EventBus.emit(CORE_EVENTS.TIMELINE_APPENDED, {
    projetoId: model.projetoId,
    codigoOficial: model.codigoOficial,
    timeline: entry,
  })

  return [...model.timeline, entry]
}

const ensureStageSnapshot = (
  model: WorkflowModel,
  status: WorkflowStatus,
  actorName: string
) => {
  const now = toNowIso()
  const stages = model.etapas ?? {}
  return (
    stages[status] ?? {
      responsavel: actorName,
      data: now,
      prazo: toDefaultDeadline(),
      status,
      checklist: [],
      timelineIds: [],
      notificationIds: [],
      arquivos: [],
      comentarios: [],
    }
  )
}

export const WorkflowService = {
  async configureFlow(projetoId: string, flow: WorkflowStatus[]) {
    const checked = validateWorkflowFlow(flow)
    if (!checked.ok) {
      throw new Error(checked.errors.join('; '))
    }

    await REPOSITORY.saveFlowConfig(projetoId, flow)
  },

  async ensureWorkflow(params: {
    projetoId: string
    tipo: WorkflowTypeCode
    actor: WorkflowActor
    initialStatus?: WorkflowStatus
    flow?: WorkflowStatus[]
    codigoOficial?: string
  }): Promise<WorkflowModel> {
    const existing = await REPOSITORY.getByProjetoId(params.projetoId)
    if (existing) {
      const normalized = normalizeModel(existing)
      if (!existing.etapas) {
        await REPOSITORY.save(normalized)
      }
      return normalized
    }

    const configuredFlow = (await REPOSITORY.getFlowConfig(params.projetoId)) ?? normalizeFlow(params.flow)
    const initialStatus = params.initialStatus ?? WORKFLOW_STATUS.LEAD
    const code = params.codigoOficial ?? (await RevisionService.generateOfficialCode(params.tipo))

    const model = createWorkflowModel({
      projetoId: params.projetoId,
      codigoOficial: code,
      tipo: params.tipo,
      flow: configuredFlow,
      statusInicial: initialStatus,
    })

    const timeline = createWorkflowTimelineEntry({
      actor: params.actor,
      acao: 'CRIACAO_WORKFLOW',
      statusAnterior: null,
      statusNovo: initialStatus,
      observacao: 'Workflow inicial criado automaticamente',
    })

    model.timeline = [timeline]
    model.etapas = {
      ...model.etapas,
      [initialStatus]: {
        responsavel: params.actor.name,
        data: toNowIso(),
        prazo: toDefaultDeadline(),
        status: initialStatus,
        checklist: [],
        timelineIds: [timeline.id],
        notificationIds: [],
        arquivos: [],
        comentarios: [],
      },
    }

    await REPOSITORY.save(model)

    EventBus.emit(CORE_EVENTS.WORKFLOW_CHANGED, {
      projetoId: model.projetoId,
      statusAnterior: null,
      statusNovo: model.status,
      codigoOficial: model.codigoOficial,
      actor: params.actor,
    })

    const notification = NotificationService.notifyWorkflowChange({
      projetoId: model.projetoId,
      codigoOficial: model.codigoOficial,
      statusAnterior: null,
      statusNovo: model.status,
      usuarioNome: params.actor.name,
    })

    model.etapas[initialStatus] = {
      ...(model.etapas[initialStatus] ?? ensureStageSnapshot(model, initialStatus, params.actor.name)),
      notificationIds: [notification.id],
    }

    await REPOSITORY.save(model)

    return model
  },

  async transitionStatus(params: {
    projetoId: string
    tipo: WorkflowTypeCode
    actor: WorkflowActor
    toStatus: WorkflowStatus
    observacao?: string
    acao?: string
    flow?: WorkflowStatus[]
    codigoOficial?: string
  }): Promise<WorkflowModel> {
    const current = await this.ensureWorkflow({
      projetoId: params.projetoId,
      tipo: params.tipo,
      actor: params.actor,
      flow: params.flow,
      codigoOficial: params.codigoOficial,
    })

    if (current.status === params.toStatus) {
      return current
    }

    ensureTransition(current.status, params.toStatus)

    const timeline = appendTimeline(
      current,
      params.actor,
      params.acao ?? 'ALTERACAO_STATUS',
      params.toStatus,
      params.observacao
    )

    const timelineEntry = timeline[timeline.length - 1]
    const previousStage = ensureStageSnapshot(current, current.status, params.actor.name)
    const targetStage = ensureStageSnapshot(current, params.toStatus, params.actor.name)

    const currentNormalized = normalizeModel(current)
    const updated: WorkflowModel = {
      ...currentNormalized,
      status: params.toStatus,
      atualizadoEm: toNowIso(),
      timeline,
      etapas: {
        ...currentNormalized.etapas,
        [current.status]: {
          ...previousStage,
          status: current.status,
          responsavel: params.actor.name,
          timelineIds: [...new Set([...previousStage.timelineIds, timelineEntry.id])],
          comentarios: params.observacao
            ? [
                ...previousStage.comentarios,
                {
                  id: crypto.randomUUID(),
                  actorId: params.actor.id,
                  actorName: params.actor.name,
                  content: params.observacao,
                  createdAt: toNowIso(),
                },
              ]
            : previousStage.comentarios,
        },
        [params.toStatus]: {
          ...targetStage,
          status: params.toStatus,
          responsavel: params.actor.name,
          data: targetStage.data || toNowIso(),
          timelineIds: [...new Set([...targetStage.timelineIds, timelineEntry.id])],
          comentarios: params.observacao
            ? [
                ...targetStage.comentarios,
                {
                  id: crypto.randomUUID(),
                  actorId: params.actor.id,
                  actorName: params.actor.name,
                  content: params.observacao,
                  createdAt: toNowIso(),
                },
              ]
            : targetStage.comentarios,
        },
      },
    }

    await REPOSITORY.save(updated)

    EventBus.emit(CORE_EVENTS.WORKFLOW_CHANGED, {
      projetoId: updated.projetoId,
      codigoOficial: updated.codigoOficial,
      statusAnterior: current.status,
      statusNovo: updated.status,
      actor: params.actor,
    })

    const notification = NotificationService.notifyWorkflowChange({
      projetoId: updated.projetoId,
      codigoOficial: updated.codigoOficial,
      statusAnterior: current.status,
      statusNovo: updated.status,
      usuarioNome: params.actor.name,
    })

    updated.etapas[params.toStatus] = {
          ...(updated.etapas[params.toStatus] ??
            ensureStageSnapshot(updated, params.toStatus, params.actor.name)),
      notificationIds: [
        ...new Set([
          ...(updated.etapas[params.toStatus]?.notificationIds ?? []),
          notification.id,
        ]),
      ],
    }

    await REPOSITORY.save(updated)

    await AuditService.record({
      id: crypto.randomUUID(),
      userId: params.actor.id,
      userName: params.actor.name,
      role: params.actor.role,
      action: 'UPDATE',
      entity: 'workflow',
      entityId: updated.id,
      timestamp: updated.atualizadoEm,
      details: {
        projetoId: updated.projetoId,
        codigoOficial: updated.codigoOficial,
        statusAnterior: current.status,
        statusNovo: updated.status,
        observacao: params.observacao ?? '',
      },
    })

    return updated
  },

  async processManagerApproval(params: {
    projetoId: string
    tipo: WorkflowTypeCode
    actor: WorkflowActor
    decision: 'APROVAR' | 'SOLICITAR_REVISAO'
    observacao?: string
  }): Promise<WorkflowModel> {
    const current = await this.ensureWorkflow({
      projetoId: params.projetoId,
      tipo: params.tipo,
      actor: params.actor,
    })

    const validation = validateManagerApproval(params.actor.role, params.decision)
    if (!validation.ok) {
      throw new Error(validation.reason)
    }

    const targetStatus =
      params.decision === 'SOLICITAR_REVISAO'
        ? WORKFLOW_STATUS.EM_PROJETO
        : current.flow[current.flow.indexOf(current.status) + 1] ?? current.status

    if (targetStatus === current.status && params.decision === 'APROVAR') {
      throw new Error('Nao existe etapa seguinte para aprovacao')
    }

    const changed = await this.transitionStatus({
      projetoId: params.projetoId,
      tipo: params.tipo,
      actor: params.actor,
      toStatus: targetStatus,
      observacao: params.observacao,
      acao: params.decision === 'APROVAR' ? 'APROVACAO_GERENTE' : 'SOLICITACAO_REVISAO_GERENTE',
    })

    changed.aprovacoes = [
      ...changed.aprovacoes,
      {
        id: crypto.randomUUID(),
        gerenteId: params.actor.id,
        gerenteNome: params.actor.name,
        decisao: params.decision,
        statusAnterior: current.status,
        statusNovo: changed.status,
        observacao: params.observacao ?? '',
        criadoEm: toNowIso(),
      },
    ]

    await REPOSITORY.save(changed)

    EventBus.emit(
      params.decision === 'APROVAR' ? CORE_EVENTS.WORKFLOW_APPROVED : CORE_EVENTS.WORKFLOW_REVISION_REQUESTED,
      {
        projetoId: changed.projetoId,
        codigoOficial: changed.codigoOficial,
        statusAnterior: current.status,
        statusNovo: changed.status,
        actor: params.actor,
      }
    )

    return changed
  },

  reviseOfficialCode(code: string) {
    try {
      return RevisionService.nextRevision(code)
    } catch (error) {
      LoggerService.error('Falha ao revisar codigo oficial', error)
      throw error
    }
  },

  async upsertOperationalStage(params: {
    projetoId: string
    tipo: WorkflowTypeCode
    actor: WorkflowActor
    status: WorkflowStatus
    responsavel?: string
    prazo?: string
    checklist?: Array<{ id?: string; label: string; done: boolean }>
    arquivos?: WorkflowFileReference[]
    comentario?: string
  }) {
    const model = await this.ensureWorkflow({
      projetoId: params.projetoId,
      tipo: params.tipo,
      actor: params.actor,
      initialStatus: params.status,
    })

    const baseStage = ensureStageSnapshot(model, params.status, params.actor.name)
    const checklist =
      params.checklist?.map((item) => ({
        id: item.id ?? crypto.randomUUID(),
        label: item.label,
        done: item.done,
      })) ?? baseStage.checklist

    const comments: WorkflowComment[] = params.comentario
      ? [
          ...baseStage.comentarios,
          {
            id: crypto.randomUUID(),
            actorId: params.actor.id,
            actorName: params.actor.name,
            content: params.comentario,
            createdAt: toNowIso(),
          },
        ]
      : baseStage.comentarios

    const updated: WorkflowModel = {
      ...model,
      atualizadoEm: toNowIso(),
      etapas: {
        ...model.etapas,
        [params.status]: {
          ...baseStage,
          status: params.status,
          responsavel: params.responsavel ?? baseStage.responsavel,
          prazo: params.prazo ?? baseStage.prazo,
          checklist,
          arquivos: params.arquivos ? [...baseStage.arquivos, ...params.arquivos] : baseStage.arquivos,
          comentarios: comments,
        },
      },
    }

    await REPOSITORY.save(updated)
    return updated
  },
}
