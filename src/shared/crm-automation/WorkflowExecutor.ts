/**
 * WorkflowExecutor — executa ações de automação usando os serviços existentes
 */

import { AuditService } from '@/shared/services/AuditService'
import { NotificationService } from '@/shared/services/NotificationService'
import { TimelineService } from '@/shared/services/TimelineService'
import { WorkflowEventBus } from './WorkflowEventBus'
import type { AutomationAction, AutomationRule } from './WorkflowRules'
import type { CRMStatusChangedPayload } from './WorkflowEventBus'

const TASKS_STORAGE = 'riagro.crm.automation.tasks'
const FOLLOWUPS_STORAGE = 'riagro.crm.automation.followups'

export interface AutomationTask {
  id: string
  ruleId: string
  entityId: string
  titulo: string
  responsavelRole: string
  status: 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA'
  prazo?: string
  clienteNome?: string
  criadoEm: string
}

export interface AutomationFollowUp {
  id: string
  entityId: string
  titulo: string
  dataHora: string
  clienteNome?: string
  criadoEm: string
  status: 'PENDENTE' | 'REALIZADO'
}

const readTasks = (): AutomationTask[] => {
  try {
    const raw = globalThis.localStorage?.getItem(TASKS_STORAGE)
    return raw ? (JSON.parse(raw) as AutomationTask[]) : []
  } catch { return [] }
}

const saveTasks = (tasks: AutomationTask[]) => {
  globalThis.localStorage?.setItem(TASKS_STORAGE, JSON.stringify(tasks.slice(0, 2000)))
}

const readFollowUps = (): AutomationFollowUp[] => {
  try {
    const raw = globalThis.localStorage?.getItem(FOLLOWUPS_STORAGE)
    return raw ? (JSON.parse(raw) as AutomationFollowUp[]) : []
  } catch { return [] }
}

const saveFollowUps = (followUps: AutomationFollowUp[]) => {
  globalThis.localStorage?.setItem(FOLLOWUPS_STORAGE, JSON.stringify(followUps.slice(0, 2000)))
}

export const WorkflowExecutor = {
  async executeRule(rule: AutomationRule, payload: CRMStatusChangedPayload): Promise<void> {
    for (const action of rule.acoes) {
      await this.executeAction(action, rule, payload)
    }
  },

  async executeAction(
    action: AutomationAction,
    rule: AutomationRule,
    payload: CRMStatusChangedPayload
  ): Promise<void> {
    const now = new Date().toISOString()
    const actor = { id: payload.usuarioId ?? 'CRM-AUTO', name: payload.usuarioNome ?? 'Automação CRM', role: 'ADMINISTRADOR' as const }

    switch (action.tipo) {
      case 'CRIAR_TAREFA': {
        const task: AutomationTask = {
          id: crypto.randomUUID(),
          ruleId: rule.id,
          entityId: payload.entityId,
          titulo: action.params?.titulo ?? rule.nome,
          responsavelRole: action.params?.responsavelRole ?? 'COMERCIAL',
          status: 'PENDENTE',
          prazo: action.params?.slaHoras
            ? new Date(Date.now() + action.params.slaHoras * 3_600_000).toISOString()
            : undefined,
          clienteNome: payload.clienteNome,
          criadoEm: now,
        }
        saveTasks([task, ...readTasks()])
        WorkflowEventBus.emitTaskCreated({
          taskId: task.id,
          titulo: task.titulo,
          responsavelRole: task.responsavelRole,
          prazo: task.prazo,
          entityId: payload.entityId,
          clienteNome: payload.clienteNome,
        })
        break
      }

      case 'AGENDAR_FOLLOWUP': {
        const followUp: AutomationFollowUp = {
          id: crypto.randomUUID(),
          entityId: payload.entityId,
          titulo: action.params?.titulo ?? rule.nome,
          dataHora: new Date(Date.now() + (action.params?.slaHoras ?? 48) * 3_600_000).toISOString(),
          clienteNome: payload.clienteNome,
          criadoEm: now,
          status: 'PENDENTE',
        }
        saveFollowUps([followUp, ...readFollowUps()])
        WorkflowEventBus.emitFollowUpScheduled(followUp)
        break
      }

      case 'NOTIFICAR':
        NotificationService.create(
          'info',
          action.params?.titulo ?? rule.nome,
          `${payload.clienteNome ?? payload.entityId}: ${payload.statusAnterior} → ${payload.statusNovo}`,
          { entityId: payload.entityId, ruleId: rule.id, roles: action.params?.notificarRole }
        )
        break

      case 'REGISTRAR_TIMELINE':
        TimelineService.append(payload.entityId, payload.codigoInterno ?? payload.entityId, {
          id: crypto.randomUUID(),
          type: 'AUTOMACAO',
          message: action.params?.mensagem ?? `${rule.nome}: ${payload.statusNovo}`,
          actorId: actor.id,
          actorName: actor.name,
          createdAt: now,
          action: rule.id,
          previousStatus: payload.statusAnterior,
          nextStatus: payload.statusNovo,
          observation: `Automação CRM: ${rule.descricao}`,
        })
        break

      case 'REGISTRAR_AUDITORIA':
        await AuditService.record({
          id: crypto.randomUUID(),
          userId: actor.id,
          userName: actor.name,
          role: actor.role,
          action: 'UPDATE',
          entity: payload.entityType.toLowerCase(),
          entityId: payload.entityId,
          timestamp: now,
          details: {
            ruleId: rule.id,
            statusAnterior: payload.statusAnterior,
            statusNovo: payload.statusNovo,
            clienteNome: payload.clienteNome,
          },
        })
        break

      case 'ATUALIZAR_DASHBOARD':
        WorkflowEventBus.emitDashboardRefresh({ entityId: payload.entityId, ruleId: rule.id })
        break

      case 'DEFINIR_SLA':
        NotificationService.create(
          'info',
          `SLA definido: ${action.params?.slaHoras}h`,
          `${payload.clienteNome ?? payload.entityId}: SLA de ${action.params?.slaHoras}h para ${rule.nome}`,
          { entityId: payload.entityId, slaHoras: action.params?.slaHoras }
        )
        WorkflowEventBus.emitSLADefined({ entityId: payload.entityId, slaHoras: action.params?.slaHoras ?? 48 })
        break

      case 'ATRIBUIR_RESPONSAVEL':
        NotificationService.create(
          'info',
          `Responsável: ${action.params?.responsavelRole}`,
          `${payload.clienteNome ?? payload.entityId}: responsabilidade atribuída a ${action.params?.responsavelRole}`,
          { entityId: payload.entityId, role: action.params?.responsavelRole }
        )
        break

      case 'ATIVAR_CHECKLIST':
        WorkflowEventBus.emitChecklistCompleted({ entityId: payload.entityId, stepId: rule.id, clienteNome: payload.clienteNome })
        break

      case 'ATIVAR_UPLOAD':
        // Upload ativado — apenas registra na timeline
        TimelineService.append(payload.entityId, payload.codigoInterno ?? payload.entityId, {
          id: crypto.randomUUID(),
          type: 'UPLOAD_ATIVADO',
          message: 'Upload ativado pelo motor de automação',
          actorId: actor.id,
          actorName: actor.name,
          createdAt: now,
        })
        break

      case 'GERAR_DOCUMENTO':
        NotificationService.create(
          'info',
          `Documento gerado: ${action.params?.documentoTipo}`,
          `${payload.clienteNome ?? payload.entityId}: ${action.params?.documentoTipo} gerado automaticamente`,
          { entityId: payload.entityId, documentoTipo: action.params?.documentoTipo }
        )
        break

      case 'DISPARAR_EVENTO':
        if (action.params?.eventoTipo === 'crm.workflow.completed') {
          WorkflowEventBus.emitWorkflowCompleted({
            entityId: payload.entityId,
            flowId: rule.id,
            clienteNome: payload.clienteNome,
            timestamp: now,
          })
        }
        break
    }
  },

  // ── Task management ────────────────────────────────────────────────────

  listTasks(entityId?: string): AutomationTask[] {
    const tasks = readTasks()
    return entityId ? tasks.filter((t) => t.entityId === entityId) : tasks
  },

  concluirTask(taskId: string): void {
    const tasks = readTasks()
    const idx = tasks.findIndex((t) => t.id === taskId)
    if (idx >= 0) {
      tasks[idx] = { ...tasks[idx], status: 'CONCLUIDA' }
      saveTasks(tasks)
    }
  },

  listFollowUps(entityId?: string): AutomationFollowUp[] {
    const all = readFollowUps()
    return entityId ? all.filter((f) => f.entityId === entityId) : all
  },

  realizarFollowUp(id: string): void {
    const all = readFollowUps()
    const idx = all.findIndex((f) => f.id === id)
    if (idx >= 0) {
      all[idx] = { ...all[idx], status: 'REALIZADO' }
      saveFollowUps(all)
    }
  },

  // ── Metrics ────────────────────────────────────────────────────────────

  getMetrics(): {
    totalTasks: number
    tasksPendentes: number
    followUpsPendentes: number
    fluxosAtivos: number
    fluxosConcluidos: number
  } {
    const tasks = readTasks()
    const followUps = readFollowUps()
    const executedRules = new Set(tasks.map((t) => t.ruleId))

    return {
      totalTasks: tasks.length,
      tasksPendentes: tasks.filter((t) => t.status === 'PENDENTE').length,
      followUpsPendentes: followUps.filter((f) => f.status === 'PENDENTE').length,
      fluxosAtivos: executedRules.size,
      fluxosConcluidos: tasks.filter((t) => t.status === 'CONCLUIDA').length,
    }
  },
}
