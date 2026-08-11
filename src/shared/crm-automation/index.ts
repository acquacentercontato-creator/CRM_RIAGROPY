export { AutomationService } from './AutomationService'
export { WorkflowEngine, CRM_EVENTS } from './WorkflowEngine'
export { WorkflowEventBus } from './WorkflowEventBus'
export { WorkflowExecutor } from './WorkflowExecutor'
export { AuditTimelineService } from './AuditTimelineService'
export { CRM_AUTOMATION_RULES, AUTOMATION_RULES_MAP, findMatchingRules } from './WorkflowRules'
export type {
  AutomationRule,
  AutomationAction,
  AutomationActionType,
} from './WorkflowRules'
export type {
  CRMStatusChangedPayload,
  CRMTaskCreatedPayload,
  CRMEventType,
} from './WorkflowEventBus'
export type { AutomationMetrics } from './WorkflowEngine'
export type { AutomationTask, AutomationFollowUp } from './WorkflowExecutor'
export type { CRMAuditEntry, CRMHistoricoItem } from './AuditTimelineService'
