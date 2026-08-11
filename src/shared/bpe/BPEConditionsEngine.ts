/**
 * Motor de condições — avalia se os pré-requisitos estão satisfeitos
 */

import { WorkflowPipelineService } from '@/shared/workflow/pipeline/WorkflowPipelineService'
import type { BPEConditionContext, BPEConditionId, BPEApprovalType, BPEApprovalStatus } from './BPETypes'

const APPROVAL_KEY = 'riagro.bpe.approvals'

type ApprovalStore = Record<string, Record<BPEApprovalType, BPEApprovalStatus>>

const readApprovals = (): ApprovalStore => {
  try {
    const raw = globalThis.localStorage?.getItem(APPROVAL_KEY)
    return raw ? (JSON.parse(raw) as ApprovalStore) : {}
  } catch {
    return {}
  }
}

export const BPEConditionsEngine = {
  /**
   * Avalia uma única condição
   */
  evaluate(conditionId: BPEConditionId, ctx: BPEConditionContext): boolean {
    switch (conditionId) {
      case 'CHECKLIST_COMPLETO': {
        if (!ctx.etapa) return false
        const stepsStatus = WorkflowPipelineService.getStepsStatus(ctx.projetoId)
        const stepState = stepsStatus.find((s) => s.step.id === ctx.etapa)
        if (!stepState) return false
        const obrigatorios = stepState.step.checklistObrigatorio.filter((item) => item.obrigatorio)
        return obrigatorios.every(
          (item) => stepState.state.checklistItems.find((c) => c.id === item.id)?.done
        )
      }

      case 'RESPONSAVEL_DEFINIDO': {
        const stepsStatus = WorkflowPipelineService.getStepsStatus(ctx.projetoId)
        const current = stepsStatus.find((s) => s.state.status === 'EM_ANDAMENTO')
        return Boolean(current?.state.responsavelAtual)
      }

      case 'PRAZO_VALIDO': {
        const stepsStatus = WorkflowPipelineService.getStepsStatus(ctx.projetoId)
        const current = stepsStatus.find((s) => s.state.status === 'EM_ANDAMENTO')
        if (!current?.state.dataLimite) return false
        return new Date(current.state.dataLimite) > new Date()
      }

      case 'POSSUI_ANEXOS_OBRIGATORIOS':
        return Boolean(ctx.metadados?.possuiAnexos)

      case 'VENDA_APROVADA':
        return this.isApproved(ctx.projetoId, 'GERENCIA') || Boolean(ctx.metadados?.vendaAprovada)

      case 'PAGAMENTO_LIBERADO':
        return this.isApproved(ctx.projetoId, 'FINANCEIRO')

      case 'APROVACAO_ENGENHARIA':
        return this.isApproved(ctx.projetoId, 'ENGENHARIA')

      case 'APROVACAO_FINANCEIRO':
        return this.isApproved(ctx.projetoId, 'FINANCEIRO')

      case 'APROVACAO_GERENCIA':
        return this.isApproved(ctx.projetoId, 'GERENCIA')

      case 'APROVACAO_OBRAS':
        return this.isApproved(ctx.projetoId, 'OBRAS')

      case 'APROVACAO_ASSISTENCIA':
        return this.isApproved(ctx.projetoId, 'ASSISTENCIA')

      case 'SEM_BLOQUEIO': {
        const state = WorkflowPipelineService.getState(ctx.projetoId)
        if (!state) return false
        return !Object.values(state.etapas).some((e) => e.status === 'BLOQUEADO')
      }

      default:
        return true
    }
  },

  /**
   * Avalia múltiplas condições (AND logic)
   */
  evaluateAll(conditionIds: BPEConditionId[], ctx: BPEConditionContext): boolean {
    return conditionIds.every((id) => this.evaluate(id, ctx))
  },

  isApproved(projetoId: string, tipo: BPEApprovalType): boolean {
    const store = readApprovals()
    return store[projetoId]?.[tipo] === 'APROVADO'
  },

  isPending(projetoId: string, tipo: BPEApprovalType): boolean {
    const store = readApprovals()
    return store[projetoId]?.[tipo] === 'PENDENTE'
  },
}
