/**
 * Orquestrador central do BPE — conecta triggers → condições → ações
 * Usa exclusivamente os serviços existentes: WorkflowService, EventBus, NotificationService, AuditService
 */

import { CORE_EVENTS, EventBus } from '@/shared/services/EventBus'
import { WorkflowPipelineService } from '@/shared/workflow/pipeline/WorkflowPipelineService'
import { BPEActionsEngine } from './BPEActionsEngine'
import { BPEApprovalsEngine } from './BPEApprovalsEngine'
import { BPEConditionsEngine } from './BPEConditionsEngine'
import { BPE_DEFAULT_RULES } from './BPERulesDefinition'
import type { BPEDashboardMetrics, BPEExecutionContext, BPETriggerPayload, BPETriggerType } from './BPETypes'

// Rastreia regras já disparadas por projeto para evitar re-execução de non-repetíveis
const firedRules = new Map<string, Set<string>>()

const hasRuleFired = (projetoId: string, ruleId: string) => {
  return firedRules.get(projetoId)?.has(ruleId) ?? false
}

const markRuleFired = (projetoId: string, ruleId: string) => {
  const set = firedRules.get(projetoId) ?? new Set<string>()
  set.add(ruleId)
  firedRules.set(projetoId, set)
}

let initialized = false

export const BPEOrchestrator = {
  /**
   * Inicializa o orquestrador e registra listeners no EventBus
   * Deve ser chamado uma única vez ao montar o App
   */
  init() {
    if (initialized) return
    initialized = true

    // Ouvir mudanças de workflow
    EventBus.on<{
      projetoId: string
      codigoOficial: string
      statusAnterior: string | null
      statusNovo: string
      actor?: { id: string; name: string }
    }>(CORE_EVENTS.WORKFLOW_CHANGED, (payload) => {
      const trigger: BPETriggerType = payload.statusAnterior ? 'ETAPA_CONCLUIDA' : 'CRIADO'
      this.fire(trigger, {
        projetoId: payload.projetoId,
        codigoOficial: payload.codigoOficial,
        usuarioId: payload.actor?.id,
        usuarioNome: payload.actor?.name,
        statusAnterior: null,
        statusNovo: undefined,
        timestamp: new Date().toISOString(),
      })
    })

    // Ouvir aprovações
    EventBus.on<{ projetoId: string; codigoOficial: string; decisao: 'APROVADO' | 'REPROVADO' }>(
      CORE_EVENTS.WORKFLOW_APPROVED,
      (payload) => {
        this.fire(payload.decisao === 'APROVADO' ? 'APROVADO' : 'REPROVADO', {
          projetoId: payload.projetoId,
          codigoOficial: payload.codigoOficial,
          timestamp: new Date().toISOString(),
        })
      }
    )
  },

  /**
   * Disparar manualmente um trigger
   */
  async fire(trigger: BPETriggerType, payload: BPETriggerPayload): Promise<void> {
    const pipelineState = WorkflowPipelineService.getState(payload.projetoId)

    const ctx: BPEExecutionContext = {
      projetoId: payload.projetoId,
      codigoOficial: payload.codigoOficial,
      clienteNome: pipelineState?.clienteNome ?? '',
      etapa: pipelineState?.etapaAtualId,
      trigger,
      payload,
      aprovacoes: {} as BPEExecutionContext['aprovacoes'],
      checklistCompleto: false,
      possuiAnexos: Boolean(payload.metadados?.possuiAnexos),
      responsavelDefinido: false,
    }

    // Avaliar e executar regras ativas que correspondem ao trigger
    const applicableRules = BPE_DEFAULT_RULES.filter(
      (rule) => rule.ativo && rule.gatilho === trigger
    ).sort((a, b) => a.prioridade - b.prioridade)

    for (const rule of applicableRules) {
      // Verificar se já disparou (para non-repetíveis)
      if (!rule.repetivel && hasRuleFired(payload.projetoId, rule.id)) {
        continue
      }

      // Avaliar condições
      const conditionsMet = BPEConditionsEngine.evaluateAll(rule.condicoes, {
        projetoId: payload.projetoId,
        etapa: ctx.etapa,
        metadados: payload.metadados,
      })

      if (!conditionsMet) continue

      // Executar ações
      await BPEActionsEngine.executeAll(rule.acoes, ctx)

      if (!rule.repetivel) {
        markRuleFired(payload.projetoId, rule.id)
      }
    }
  },

  /**
   * Dispara evento de arquivo anexado
   */
  async onArquivoAnexado(projetoId: string, codigoOficial: string, usuarioNome?: string): Promise<void> {
    await this.fire('ARQUIVO_ANEXADO', {
      projetoId,
      codigoOficial,
      usuarioNome,
      timestamp: new Date().toISOString(),
    })
  },

  /**
   * Dispara evento de responsável alterado
   */
  async onResponsavelAlterado(projetoId: string, codigoOficial: string, usuarioNome?: string): Promise<void> {
    await this.fire('RESPONSAVEL_ALTERADO', {
      projetoId,
      codigoOficial,
      usuarioNome,
      timestamp: new Date().toISOString(),
    })
  },

  /**
   * Verifica projetos com SLA vencido e dispara triggers
   */
  async verificarSLAs(): Promise<void> {
    WorkflowPipelineService.atualizarSLAs()
  },

  /**
   * Calcula métricas do BPE para o dashboard
   */
  getDashboardMetrics(): BPEDashboardMetrics {
    const pipelineMetrics = WorkflowPipelineService.calcularMetricas()
    const pendentes = BPEApprovalsEngine.listarPendentes()
    const taskMetrics = BPEActionsEngine.getTaskMetrics()

    return {
      aguardandoAprovacao: pendentes,
      aguardandoResponsavel: pipelineMetrics.projetosBloqueados.map((p) => ({
        projetoId: p.id,
        codigo: p.codigo,
        etapa: p.etapa,
      })),
      bloqueados: pipelineMetrics.projetosBloqueados.map((p) => ({
        projetoId: p.id,
        codigo: p.codigo,
        motivo: p.motivo,
      })),
      semMovimentacao: pipelineMetrics.projetosAtrasados.map((p) => ({
        projetoId: p.id,
        codigo: p.codigo,
        diasParado: p.diasAtraso,
      })),
      slaVencido: pipelineMetrics.projetosAtrasados.map((p) => ({
        projetoId: p.id,
        codigo: p.codigo,
        etapa: p.etapa,
        diasAtraso: p.diasAtraso,
      })),
      totalTarefas: taskMetrics.total,
      tarefasPendentes: taskMetrics.pendentes,
    }
  },
}
