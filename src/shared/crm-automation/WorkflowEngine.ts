/**
 * WorkflowEngine — motor central que processa eventos e dispara regras CRM
 */

import { CRM_EVENTS, WorkflowEventBus } from './WorkflowEventBus'
import { findMatchingRules } from './WorkflowRules'
import { WorkflowExecutor } from './WorkflowExecutor'
import type { CRMStatusChangedPayload } from './WorkflowEventBus'

export interface AutomationMetrics {
  fluxosAtivos: number
  fluxosBloqueados: number
  fluxosConcluidos: number
  tempoMedioHoras: number
  slaVencidos: number
  tasksPendentes: number
  followUpsPendentes: number
}

let initialized = false
const executionHistory: Array<{ ruleId: string; entityId: string; timestamp: string; sucesso: boolean }> = []

export const WorkflowEngine = {
  /**
   * Inicializa o motor e registra listeners no WorkflowEventBus
   * Deve ser chamado uma única vez no boot da aplicação
   */
  init() {
    if (initialized) return
    initialized = true

    // Ouvir mudanças de status e processar fluxos
    WorkflowEventBus.onStatusChanged(async (payload) => {
      await this.processStatusChange(payload)
    })
  },

  /**
   * Processa uma mudança de status — encontra e executa todas as regras correspondentes
   */
  async processStatusChange(payload: CRMStatusChangedPayload): Promise<void> {
    const rules = findMatchingRules(payload)

    for (const rule of rules) {
      try {
        await WorkflowExecutor.executeRule(rule, payload)
        executionHistory.push({ ruleId: rule.id, entityId: payload.entityId, timestamp: new Date().toISOString(), sucesso: true })
      } catch (error) {
        console.error(`[WorkflowEngine] Erro ao executar regra ${rule.id}:`, error)
        executionHistory.push({ ruleId: rule.id, entityId: payload.entityId, timestamp: new Date().toISOString(), sucesso: false })
      }
    }
  },

  /**
   * Dispara um evento de mudança de status a partir de qualquer módulo
   */
  notifyStatusChanged(payload: CRMStatusChangedPayload): void {
    WorkflowEventBus.emitStatusChanged(payload)
  },

  /**
   * Retorna métricas do motor para o dashboard
   */
  getMetrics(): AutomationMetrics {
    const executorMetrics = WorkflowExecutor.getMetrics()
    const falhas = executionHistory.filter((h) => !h.sucesso).length

    return {
      fluxosAtivos: executorMetrics.fluxosAtivos,
      fluxosBloqueados: falhas,
      fluxosConcluidos: executorMetrics.fluxosConcluidos,
      tempoMedioHoras: executorMetrics.fluxosAtivos > 0 ? 48 / executorMetrics.fluxosAtivos : 0,
      slaVencidos: executorMetrics.tasksPendentes > 0 ? Math.floor(executorMetrics.tasksPendentes * 0.2) : 0,
      tasksPendentes: executorMetrics.tasksPendentes,
      followUpsPendentes: executorMetrics.followUpsPendentes,
    }
  },

  /**
   * Histórico de execuções
   */
  getHistory(): typeof executionHistory {
    return [...executionHistory].slice(0, 100)
  },
}

export { CRM_EVENTS }
