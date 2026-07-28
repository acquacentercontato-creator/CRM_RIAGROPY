import type { AppRole } from '@/shared/types/auth'
import type { WorkflowStatus, WorkflowTypeCode } from '@/shared/workflow/WorkflowTypes'

export type WorkflowActor = {
  id: string
  name: string
  role: AppRole
}

export type WorkflowTimelineEntry = {
  id: string
  usuarioId: string
  usuarioNome: string
  data: string
  hora: string
  acao: string
  statusAnterior: WorkflowStatus | null
  statusNovo: WorkflowStatus
  observacao: string
  criadoEm: string
}

export type WorkflowApproval = {
  id: string
  gerenteId: string
  gerenteNome: string
  decisao: 'APROVAR' | 'SOLICITAR_REVISAO'
  statusAnterior: WorkflowStatus
  statusNovo: WorkflowStatus
  observacao: string
  criadoEm: string
}

export type WorkflowChecklistItem = {
  id: string
  label: string
  done: boolean
}

export type WorkflowFileReference = {
  id: string
  name: string
  url: string
  category: string
}

export type WorkflowComment = {
  id: string
  actorId: string
  actorName: string
  content: string
  createdAt: string
}

export type WorkflowOperationalStage = {
  responsavel: string
  data: string
  prazo: string
  status: WorkflowStatus
  checklist: WorkflowChecklistItem[]
  timelineIds: string[]
  notificationIds: string[]
  arquivos: WorkflowFileReference[]
  comentarios: WorkflowComment[]
}

export type WorkflowModel = {
  id: string
  projetoId: string
  codigoOficial: string
  tipo: WorkflowTypeCode
  versao: number
  status: WorkflowStatus
  flow: WorkflowStatus[]
  timeline: WorkflowTimelineEntry[]
  aprovacoes: WorkflowApproval[]
  etapas: Partial<Record<WorkflowStatus, WorkflowOperationalStage>>
  criadoEm: string
  atualizadoEm: string
}

const nowIso = () => new Date().toISOString()

export const createWorkflowTimelineEntry = (params: {
  actor: WorkflowActor
  acao: string
  statusAnterior: WorkflowStatus | null
  statusNovo: WorkflowStatus
  observacao?: string
}): WorkflowTimelineEntry => {
  const createdAt = nowIso()
  const dateRef = new Date(createdAt)

  return {
    id: crypto.randomUUID(),
    usuarioId: params.actor.id,
    usuarioNome: params.actor.name,
    data: dateRef.toISOString().slice(0, 10),
    hora: dateRef.toTimeString().slice(0, 8),
    acao: params.acao,
    statusAnterior: params.statusAnterior,
    statusNovo: params.statusNovo,
    observacao: params.observacao ?? '',
    criadoEm: createdAt,
  }
}

export const createWorkflowModel = (params: {
  projetoId: string
  codigoOficial: string
  tipo: WorkflowTypeCode
  flow: WorkflowStatus[]
  statusInicial: WorkflowStatus
}): WorkflowModel => {
  const now = nowIso()

  return {
    id: crypto.randomUUID(),
    projetoId: params.projetoId,
    codigoOficial: params.codigoOficial,
    tipo: params.tipo,
    versao: 1,
    status: params.statusInicial,
    flow: params.flow,
    timeline: [],
    aprovacoes: [],
    etapas: {},
    criadoEm: now,
    atualizadoEm: now,
  }
}
