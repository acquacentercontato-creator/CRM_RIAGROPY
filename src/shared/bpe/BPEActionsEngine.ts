/**
 * Motor de ações — executa ações com base em triggers e regras
 */

import { AuditService } from '@/shared/services/AuditService'
import { EventBus } from '@/shared/services/EventBus'
import { NotificationService } from '@/shared/services/NotificationService'
import { WorkflowPipelineService } from '@/shared/workflow/pipeline/WorkflowPipelineService'
import { BPEApprovalsEngine } from './BPEApprovalsEngine'
import type { BPEAction, BPEExecutionContext, BPETask } from './BPETypes'

const TASKS_KEY = 'riagro.bpe.tasks'

const readTasks = (): BPETask[] => {
  try {
    const raw = globalThis.localStorage?.getItem(TASKS_KEY)
    return raw ? (JSON.parse(raw) as BPETask[]) : []
  } catch {
    return []
  }
}

const saveTasks = (tasks: BPETask[]) => {
  globalThis.localStorage?.setItem(TASKS_KEY, JSON.stringify(tasks.slice(0, 1000)))
}

export const BPEActionsEngine = {
  /**
   * Executa uma lista de ações em sequência
   */
  async executeAll(acoes: BPEAction[], ctx: BPEExecutionContext): Promise<void> {
    for (const acao of acoes) {
      await this.execute(acao, ctx)
    }
  },

  /**
   * Executa uma ação individual
   */
  async execute(acao: BPEAction, ctx: BPEExecutionContext): Promise<void> {
    const now = new Date().toISOString()

    switch (acao.id) {
      case 'CRIAR_NOTIFICACAO':
        NotificationService.create(
          'info',
          acao.params?.notificacaoTitulo ?? 'BPE: Notificacao',
          acao.params?.notificacaoMensagem ?? `${ctx.codigoOficial}: ${ctx.trigger}`,
          { projetoId: ctx.projetoId, trigger: ctx.trigger }
        )
        break

      case 'ENVIAR_ALERTA':
        NotificationService.create(
          acao.params?.alertaNivel ?? 'warning',
          `Alerta: ${ctx.trigger}`,
          `${ctx.codigoOficial} — ${ctx.etapa ?? ctx.trigger}`,
          { projetoId: ctx.projetoId }
        )
        break

      case 'CRIAR_TIMELINE':
        EventBus.emit('core.timeline.appended', {
          projetoId: ctx.projetoId,
          codigoOficial: ctx.codigoOficial,
          timeline: {
            id: crypto.randomUUID(),
            usuarioId: ctx.payload.usuarioId ?? 'BPE',
            usuarioNome: ctx.payload.usuarioNome ?? 'Business Process Engine',
            data: now.split('T')[0],
            hora: now.split('T')[1],
            acao: acao.params?.timelineAcao ?? ctx.trigger,
            statusAnterior: ctx.payload.statusAnterior ?? null,
            statusNovo: ctx.payload.statusNovo ?? null,
            observacao: `BPE: ${ctx.trigger}`,
            criadoEm: now,
          },
        })
        break

      case 'CRIAR_AUDITORIA':
        await AuditService.record({
          id: crypto.randomUUID(),
          userId: ctx.payload.usuarioId ?? 'BPE',
          userName: ctx.payload.usuarioNome ?? 'Business Process Engine',
          role: 'ADMINISTRADOR',
          action: 'UPDATE',
          entity: 'bpe_action',
          entityId: ctx.projetoId,
          timestamp: now,
          details: {
            trigger: ctx.trigger,
            etapa: ctx.etapa,
            acao: acao.id,
            codigoOficial: ctx.codigoOficial,
          },
        })
        break

      case 'CRIAR_TAREFA': {
        const tasks = readTasks()
        const nova: BPETask = {
          id: crypto.randomUUID(),
          projetoId: ctx.projetoId,
          codigoOficial: ctx.codigoOficial,
          titulo: acao.params?.notificacaoTitulo ?? `Tarefa: ${ctx.trigger}`,
          descricao: acao.params?.notificacaoMensagem,
          responsavelRole: acao.params?.novoResponsavelRole ?? 'ADMINISTRADOR',
          status: 'PENDENTE',
          prazo: acao.params?.slaHoras
            ? new Date(Date.now() + acao.params.slaHoras * 3_600_000).toISOString()
            : undefined,
          criadoEm: now,
          criadoPor: ctx.payload.usuarioNome ?? 'BPE',
          etapa: ctx.etapa,
        }
        saveTasks([nova, ...tasks])
        break
      }

      case 'CRIAR_CHECKLIST':
        if (ctx.etapa && acao.params?.checklistItems) {
          acao.params.checklistItems.forEach((itemId) => {
            WorkflowPipelineService.updateChecklistItem(ctx.projetoId, ctx.etapa!, itemId, false)
          })
        }
        break

      case 'SOLICITAR_APROVACAO':
        if (acao.params?.aprovacaoTipo) {
          BPEApprovalsEngine.solicitar({
            projetoId: ctx.projetoId,
            codigoOficial: ctx.codigoOficial,
            clienteNome: ctx.clienteNome,
            tipo: acao.params.aprovacaoTipo,
            solicitadoPor: ctx.payload.usuarioNome ?? 'BPE',
            etapa: ctx.etapa,
          })
        }
        break

      case 'CRIAR_SLA': {
        const state = WorkflowPipelineService.getState(ctx.projetoId)
        if (state && ctx.etapa && acao.params?.slaHoras) {
          const deadline = new Date(Date.now() + acao.params.slaHoras * 3_600_000).toISOString()
          const etapaState = state.etapas[ctx.etapa]
          if (etapaState) {
            etapaState.dataLimite = deadline
            NotificationService.create(
              'info',
              'SLA criado',
              `${ctx.codigoOficial}: SLA de ${acao.params.slaHoras}h definido para ${ctx.etapa}`,
              { projetoId: ctx.projetoId }
            )
          }
        }
        break
      }

      case 'MOVER_PIPELINE':
        // Delegado ao BPEOrchestrator — não executado diretamente aqui
        break

      case 'ALTERAR_STATUS':
        // Delegado ao WorkflowService upstream — apenas registra
        NotificationService.create(
          'info',
          'Status alterado pelo BPE',
          `${ctx.codigoOficial}: status atualizado via ${ctx.trigger}`,
          { projetoId: ctx.projetoId, novoStatus: acao.params?.novoStatus }
        )
        break

      case 'ATUALIZAR_DASHBOARD':
        EventBus.emit('bpe.dashboard.refresh', { projetoId: ctx.projetoId, timestamp: now })
        break

      case 'ALTERAR_RESPONSAVEL':
        NotificationService.create(
          'info',
          'Responsavel alterado',
          `${ctx.codigoOficial}: responsavel atualizado.`,
          { projetoId: ctx.projetoId, novoRole: acao.params?.novoResponsavelRole }
        )
        break

      case 'CRIAR_ORDEM':
        NotificationService.create(
          'info',
          'Ordem de servico criada',
          `${ctx.codigoOficial}: OS gerada automaticamente para ${ctx.etapa}.`,
          { projetoId: ctx.projetoId }
        )
        break
    }
  },

  /** Lista tarefas de um projeto */
  listarTarefas(projetoId: string): BPETask[] {
    return readTasks().filter((t) => t.projetoId === projetoId)
  },

  /** Conclui uma tarefa */
  concluirTarefa(taskId: string): void {
    const tasks = readTasks()
    const idx = tasks.findIndex((t) => t.id === taskId)
    if (idx >= 0) {
      tasks[idx] = { ...tasks[idx], status: 'CONCLUIDA' }
      saveTasks(tasks)
    }
  },

  /** Métricas de tarefas */
  getTaskMetrics(): { total: number; pendentes: number; emAndamento: number; concluidas: number } {
    const tasks = readTasks()
    return {
      total: tasks.length,
      pendentes: tasks.filter((t) => t.status === 'PENDENTE').length,
      emAndamento: tasks.filter((t) => t.status === 'EM_ANDAMENTO').length,
      concluidas: tasks.filter((t) => t.status === 'CONCLUIDA').length,
    }
  },
}
