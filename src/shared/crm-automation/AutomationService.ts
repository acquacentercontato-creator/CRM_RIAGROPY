/**
 * AutomationService — facade principal do motor de automação CRM
 * Ponto de entrada único para todas as automações
 */

import { WorkflowEngine } from './WorkflowEngine'
import { WorkflowExecutor } from './WorkflowExecutor'
import { AuditTimelineService } from './AuditTimelineService'
import { WorkflowEventBus } from './WorkflowEventBus'
import { registerAdditionalRules } from './WorkflowRules'
import { TECHNICAL_WORKFLOW_RULES } from './TechnicalWorkflowRules'
import type { CRMStatusChangedPayload } from './WorkflowEventBus'

let started = false

export const AutomationService = {
  /**
   * Inicializa o motor de automação — chamar uma vez no App.tsx
   */
  start() {
    if (started) return
    started = true
    registerAdditionalRules(TECHNICAL_WORKFLOW_RULES)
    WorkflowEngine.init()
    console.info('[AutomationService] Motor CRM iniciado com 10 fluxos CRM + 16 fluxos técnicos.')
  },

  /**
   * Notifica mudança de status para disparar automações
   */
  async notifyStatusChanged(payload: CRMStatusChangedPayload): Promise<void> {
    WorkflowEngine.notifyStatusChanged(payload)

    await AuditTimelineService.record({
      entityId: payload.entityId,
      entityType: payload.entityType,
      acao: `Status: ${payload.statusAnterior} → ${payload.statusNovo}`,
      statusAnterior: payload.statusAnterior,
      statusNovo: payload.statusNovo,
      usuarioId: payload.usuarioId ?? 'sistema',
      usuarioNome: payload.usuarioNome ?? 'Sistema',
      timestamp: payload.timestamp,
      detalhes: { clienteNome: payload.clienteNome, codigoInterno: payload.codigoInterno },
    })
  },

  /**
   * Notifica upload de arquivo
   */
  notifyFileUploaded(params: {
    entityId: string
    fileName: string
    tipo: string
    usuarioNome?: string
    clienteNome?: string
  }) {
    WorkflowEventBus.emitFileUploaded({
      entityId: params.entityId,
      fileName: params.fileName,
      tipo: params.tipo,
      usuarioNome: params.usuarioNome,
      clienteNome: params.clienteNome,
    })
  },

  /**
   * Notifica aprovação concedida
   */
  notifyApprovalGranted(params: {
    entityId: string
    tipo: string
    responsavel: string
    observacao?: string
    clienteNome?: string
  }) {
    WorkflowEventBus.emitApprovalGranted(params)
  },

  /**
   * Notifica aprovação negada
   */
  notifyApprovalDenied(params: {
    entityId: string
    tipo: string
    responsavel: string
    observacao?: string
    clienteNome?: string
  }) {
    WorkflowEventBus.emitApprovalDenied(params)
  },

  /**
   * Retorna métricas do motor para o dashboard
   */
  getMetrics() {
    return WorkflowEngine.getMetrics()
  },

  /**
   * Lista tarefas automáticas pendentes
   */
  listTasks(entityId?: string) {
    return WorkflowExecutor.listTasks(entityId)
  },

  /**
   * Lista follow-ups automáticos pendentes
   */
  listFollowUps(entityId?: string) {
    return WorkflowExecutor.listFollowUps(entityId)
  },

  /**
   * Conclui uma tarefa automática
   */
  concluirTask(taskId: string) {
    WorkflowExecutor.concluirTask(taskId)
  },

  /**
   * Busca histórico unificado
   */
  getHistorico(entityId?: string) {
    return AuditTimelineService.getHistorico(entityId)
  },

  /**
   * Busca timeline de uma entidade
   */
  getTimeline(entityId: string) {
    return AuditTimelineService.getTimeline(entityId)
  },
}
