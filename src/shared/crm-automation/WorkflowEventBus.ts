/**
 * Eventos CRM do motor de automação — estende CORE_EVENTS existentes
 */

import { EventBus } from '@/shared/services/EventBus'

export const CRM_EVENTS = {
  // Status changes
  STATUS_CHANGED: 'crm.status.changed',

  // Lifecycle events
  TASK_CREATED: 'crm.task.created',
  CHECKLIST_COMPLETED: 'crm.checklist.completed',
  APPROVAL_GRANTED: 'crm.approval.granted',
  APPROVAL_DENIED: 'crm.approval.denied',
  FILE_UPLOADED: 'crm.file.uploaded',
  WORKFLOW_COMPLETED: 'crm.workflow.completed',

  // Flow-specific
  FOLLOW_UP_SCHEDULED: 'crm.followup.scheduled',
  SLA_DEFINED: 'crm.sla.defined',
  DASHBOARD_REFRESH: 'crm.dashboard.refresh',
} as const

export type CRMEventType = (typeof CRM_EVENTS)[keyof typeof CRM_EVENTS]

// ── Payload types ──────────────────────────────────────────────────────────

export interface CRMStatusChangedPayload {
  entityId: string
  entityType: 'CLIENTE' | 'OPORTUNIDADE' | 'VISITA' | 'LEVANTAMENTO' | 'PROJETO' | 'OBRA' | 'ENTREGA' | 'ASSISTENCIA'
  statusAnterior: string
  statusNovo: string
  usuarioId?: string
  usuarioNome?: string
  clienteNome?: string
  codigoInterno?: string
  timestamp: string
  metadados?: Record<string, unknown>
}

export interface CRMTaskCreatedPayload {
  taskId: string
  titulo: string
  responsavelRole: string
  prazo?: string
  entityId: string
  clienteNome?: string
}

export interface CRMChecklistCompletedPayload {
  entityId: string
  stepId: string
  clienteNome?: string
}

export interface CRMApprovalPayload {
  entityId: string
  tipo: string
  responsavel: string
  observacao?: string
  clienteNome?: string
}

export interface CRMFileUploadedPayload {
  entityId: string
  fileName: string
  tipo: string
  usuarioNome?: string
  clienteNome?: string
}

export interface CRMWorkflowCompletedPayload {
  entityId: string
  flowId: string
  clienteNome?: string
  timestamp: string
}

// ── WorkflowEventBus: thin wrapper adding CRM-specific emitters ───────────

export const WorkflowEventBus = {
  onStatusChanged(handler: (payload: CRMStatusChangedPayload) => void) {
    return EventBus.on(CRM_EVENTS.STATUS_CHANGED, handler)
  },

  emitStatusChanged(payload: CRMStatusChangedPayload) {
    EventBus.emit(CRM_EVENTS.STATUS_CHANGED, payload)
  },

  onTaskCreated(handler: (payload: CRMTaskCreatedPayload) => void) {
    return EventBus.on(CRM_EVENTS.TASK_CREATED, handler)
  },

  emitTaskCreated(payload: CRMTaskCreatedPayload) {
    EventBus.emit(CRM_EVENTS.TASK_CREATED, payload)
  },

  onChecklistCompleted(handler: (payload: CRMChecklistCompletedPayload) => void) {
    return EventBus.on(CRM_EVENTS.CHECKLIST_COMPLETED, handler)
  },

  emitChecklistCompleted(payload: CRMChecklistCompletedPayload) {
    EventBus.emit(CRM_EVENTS.CHECKLIST_COMPLETED, payload)
  },

  onApprovalGranted(handler: (payload: CRMApprovalPayload) => void) {
    return EventBus.on(CRM_EVENTS.APPROVAL_GRANTED, handler)
  },

  emitApprovalGranted(payload: CRMApprovalPayload) {
    EventBus.emit(CRM_EVENTS.APPROVAL_GRANTED, payload)
  },

  onApprovalDenied(handler: (payload: CRMApprovalPayload) => void) {
    return EventBus.on(CRM_EVENTS.APPROVAL_DENIED, handler)
  },

  emitApprovalDenied(payload: CRMApprovalPayload) {
    EventBus.emit(CRM_EVENTS.APPROVAL_DENIED, payload)
  },

  onFileUploaded(handler: (payload: CRMFileUploadedPayload) => void) {
    return EventBus.on(CRM_EVENTS.FILE_UPLOADED, handler)
  },

  emitFileUploaded(payload: CRMFileUploadedPayload) {
    EventBus.emit(CRM_EVENTS.FILE_UPLOADED, payload)
  },

  onWorkflowCompleted(handler: (payload: CRMWorkflowCompletedPayload) => void) {
    return EventBus.on(CRM_EVENTS.WORKFLOW_COMPLETED, handler)
  },

  emitWorkflowCompleted(payload: CRMWorkflowCompletedPayload) {
    EventBus.emit(CRM_EVENTS.WORKFLOW_COMPLETED, payload)
  },

  emitFollowUpScheduled(payload: { id: string; entityId: string; titulo: string; dataHora: string; clienteNome?: string; criadoEm: string; status: string }) {
    EventBus.emit(CRM_EVENTS.FOLLOW_UP_SCHEDULED, payload)
  },

  emitDashboardRefresh(payload: { entityId: string; ruleId: string }) {
    EventBus.emit(CRM_EVENTS.DASHBOARD_REFRESH, payload)
  },

  emitSLADefined(payload: { entityId: string; slaHoras: number }) {
    EventBus.emit(CRM_EVENTS.SLA_DEFINED, payload)
  },
}
