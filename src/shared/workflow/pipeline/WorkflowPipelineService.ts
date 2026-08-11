/**
 * Serviço central do pipeline operacional — valida dependências, SLA e automações
 */

import { AuditService } from '@/shared/services/AuditService'
import { NotificationService } from '@/shared/services/NotificationService'
import { WorkflowService } from '@/shared/workflow/WorkflowService'
import type { WorkflowActor } from '@/shared/workflow/WorkflowModel'
import type { WorkflowTypeCode } from '@/shared/workflow/WorkflowTypes'
import { PIPELINE_STEP_MAP, PIPELINE_STEPS } from './WorkflowPipelineDefinition'
import type {
  PipelineMetrics,
  PipelineProjectState,
  PipelineStepState,
  PipelineStepStatus,
  PipelineTransitionResult,
} from './WorkflowPipelineTypes'

const toNow = () => new Date().toISOString()

const calcDiasAtraso = (dataLimite?: string): number => {
  if (!dataLimite) return 0
  const diff = Date.now() - new Date(dataLimite).getTime()
  return diff > 0 ? Math.floor(diff / 86_400_000) : 0
}

const addDays = (days: number) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

// In-memory store for pipeline states (backed by WorkflowModel.etapas in Firestore)
const projectStates = new Map<string, PipelineProjectState>()

export const WorkflowPipelineService = {
  /**
   * Inicializa ou recupera o estado do pipeline para um projeto
   */
  initPipeline(params: {
    projetoId: string
    codigoOficial: string
    clienteNome: string
  }): PipelineProjectState {
    if (projectStates.has(params.projetoId)) {
      return projectStates.get(params.projetoId)!
    }

    const etapas: Record<string, PipelineStepState> = {}
    PIPELINE_STEPS.forEach((step, idx) => {
      etapas[step.id] = {
        stepId: step.id,
        status: idx === 0 ? 'EM_ANDAMENTO' : 'PENDENTE',
        dataInicio: idx === 0 ? toNow() : undefined,
        dataLimite: idx === 0 ? addDays(step.slaDias) : undefined,
        checklistItems: step.checklistObrigatorio.map((item) => ({
          id: item.id,
          done: false,
        })),
        diasAtraso: 0,
        estaAtrasado: false,
      }
    })

    const state: PipelineProjectState = {
      projetoId: params.projetoId,
      codigoOficial: params.codigoOficial,
      clienteNome: params.clienteNome,
      etapaAtualId: PIPELINE_STEPS[0].id,
      etapas,
      createdAt: toNow(),
      updatedAt: toNow(),
    }

    projectStates.set(params.projetoId, state)
    return state
  },

  /**
   * Obtém o estado atual do pipeline
   */
  getState(projetoId: string): PipelineProjectState | null {
    return projectStates.get(projetoId) ?? null
  },

  /**
   * Valida se a transição para o próximo step é permitida
   */
  validarTransicao(projetoId: string, targetStepId: string): PipelineTransitionResult {
    const state = projectStates.get(projetoId)
    if (!state) {
      return { ok: false, bloqueios: ['Pipeline nao inicializado'], checklistPendentes: [], dependenciasNaoConcluidas: [] }
    }

    const targetDef = PIPELINE_STEP_MAP[targetStepId]
    if (!targetDef) {
      return { ok: false, bloqueios: ['Etapa invalida'], checklistPendentes: [], dependenciasNaoConcluidas: [] }
    }

    const dependenciasNaoConcluidas: string[] = []
    const checklistPendentes: string[] = []
    const bloqueios: string[] = []

    // Verificar dependências
    for (const depId of targetDef.dependencias) {
      const depState = state.etapas[depId]
      if (!depState || depState.status !== 'CONCLUIDO') {
        dependenciasNaoConcluidas.push(depId)
        bloqueios.push(`workflow.bloqueio.dependencia`)
      }
    }

    // Verificar checklist da etapa atual
    const currentDef = PIPELINE_STEP_MAP[state.etapaAtualId]
    if (currentDef) {
      const currentState = state.etapas[state.etapaAtualId]
      const itensPendentes = currentDef.checklistObrigatorio
        .filter((item) => item.obrigatorio)
        .filter((item) => {
          const checkItem = currentState?.checklistItems.find((c) => c.id === item.id)
          return !checkItem?.done
        })
      itensPendentes.forEach((item) => checklistPendentes.push(item.id))
      if (itensPendentes.length > 0) {
        bloqueios.push('workflow.bloqueio.checklist')
      }
    }

    return {
      ok: bloqueios.length === 0,
      bloqueios,
      checklistPendentes,
      dependenciasNaoConcluidas,
    }
  },

  /**
   * Avança para o próximo step após validação
   */
  async avancar(params: {
    projetoId: string
    codigoOficial: string
    tipo: WorkflowTypeCode
    actor: WorkflowActor
    targetStepId?: string
    observacao?: string
  }): Promise<{ ok: boolean; state?: PipelineProjectState; erro?: string }> {
    const state = projectStates.get(params.projetoId)
    if (!state) {
      return { ok: false, erro: 'Pipeline nao inicializado' }
    }

    const currentIdx = PIPELINE_STEPS.findIndex((s) => s.id === state.etapaAtualId)
    const nextStep = PIPELINE_STEPS[currentIdx + 1]
    const targetStepId = params.targetStepId ?? nextStep?.id

    if (!targetStepId) {
      return { ok: false, erro: 'workflow.erro.ultimaEtapa' }
    }

    const validacao = this.validarTransicao(params.projetoId, targetStepId)
    if (!validacao.ok) {
      return { ok: false, erro: validacao.bloqueios[0] }
    }

    // Concluir etapa atual
    const now = toNow()
    state.etapas[state.etapaAtualId] = {
      ...state.etapas[state.etapaAtualId],
      status: 'CONCLUIDO',
      dataConclusao: now,
      diasAtraso: calcDiasAtraso(state.etapas[state.etapaAtualId]?.dataLimite),
      estaAtrasado: false,
    }

    // Ativar próxima etapa
    const targetDef = PIPELINE_STEP_MAP[targetStepId]
    state.etapas[targetStepId] = {
      ...state.etapas[targetStepId],
      stepId: targetStepId,
      status: 'EM_ANDAMENTO',
      dataInicio: now,
      dataLimite: targetDef.slaDias > 0 ? addDays(targetDef.slaDias) : undefined,
      responsavelAtual: params.actor.name,
      checklistItems: targetDef.checklistObrigatorio.map((item) => ({
        id: item.id,
        done: false,
      })),
      diasAtraso: 0,
      estaAtrasado: false,
    }

    state.etapaAtualId = targetStepId
    state.updatedAt = now

    // Transição no WorkflowService existente
    await WorkflowService.transitionStatus({
      projetoId: params.projetoId,
      tipo: params.tipo,
      actor: params.actor,
      toStatus: targetDef.workflowStatus,
      observacao: params.observacao,
      acao: `PIPELINE_AVANCO_${targetStepId}`,
    })

    // Notificação se necessário
    if (targetDef.notificarResponsavel) {
      NotificationService.notifyWorkflowChange({
        projetoId: params.projetoId,
        codigoOficial: params.codigoOficial,
        statusAnterior: PIPELINE_STEP_MAP[state.etapaAtualId]?.workflowStatus ?? null,
        statusNovo: targetDef.workflowStatus,
        usuarioNome: params.actor.name,
      })
    }

    // Auditoria
    await AuditService.record({
      id: crypto.randomUUID(),
      userId: params.actor.id,
      userName: params.actor.name,
      role: params.actor.role,
      action: 'UPDATE',
      entity: 'pipeline',
      entityId: params.projetoId,
      timestamp: now,
      details: {
        etapaAnterior: state.etapaAtualId,
        novaEtapa: targetStepId,
        codigoOficial: params.codigoOficial,
        observacao: params.observacao ?? '',
      },
    })

    projectStates.set(params.projetoId, state)
    return { ok: true, state }
  },

  /**
   * Atualiza item do checklist de uma etapa
   */
  updateChecklistItem(projetoId: string, stepId: string, itemId: string, done: boolean): void {
    const state = projectStates.get(projetoId)
    if (!state) return

    const etapa = state.etapas[stepId]
    if (!etapa) return

    const item = etapa.checklistItems.find((c) => c.id === itemId)
    if (item) {
      item.done = done
      state.updatedAt = toNow()
      projectStates.set(projetoId, state)
    }
  },

  /**
   * Bloquear etapa manualmente
   */
  bloquear(projetoId: string, stepId: string, motivo: string): void {
    const state = projectStates.get(projetoId)
    if (!state) return

    const etapa = state.etapas[stepId]
    if (etapa) {
      etapa.status = 'BLOQUEADO'
      etapa.observacoes = motivo
      state.updatedAt = toNow()
      projectStates.set(projetoId, state)
    }
  },

  /**
   * Atualiza SLAs e detecta atrasos em todos os projetos
   */
  atualizarSLAs(): void {
    for (const [id, state] of projectStates.entries()) {
      for (const etapa of Object.values(state.etapas)) {
        if (etapa.status === 'EM_ANDAMENTO' && etapa.dataLimite) {
          const diasAtraso = calcDiasAtraso(etapa.dataLimite)
          etapa.diasAtraso = diasAtraso
          etapa.estaAtrasado = diasAtraso > 0
        }
      }
      projectStates.set(id, state)
    }
  },

  /**
   * Calcula métricas do pipeline para o dashboard
   */
  calcularMetricas(): PipelineMetrics {
    this.atualizarSLAs()

    const metrics: PipelineMetrics = {
      totalProjetos: projectStates.size,
      porEtapa: {},
      bloqueados: 0,
      atrasados: 0,
      aguardandoAcao: 0,
      tempoMedioPorEtapa: {},
      tempoMedioPorResponsavel: {},
      projetosBloqueados: [],
      projetosAtrasados: [],
    }

    for (const state of projectStates.values()) {
      const etapaAtual = state.etapas[state.etapaAtualId]
      const stepDef = PIPELINE_STEP_MAP[state.etapaAtualId]

      // Contagem por etapa
      metrics.porEtapa[state.etapaAtualId] = (metrics.porEtapa[state.etapaAtualId] ?? 0) + 1

      // Bloqueados
      if (etapaAtual?.status === 'BLOQUEADO') {
        metrics.bloqueados++
        metrics.projetosBloqueados.push({
          id: state.projetoId,
          codigo: state.codigoOficial,
          cliente: state.clienteNome,
          etapa: state.etapaAtualId,
          motivo: etapaAtual.observacoes ?? 'workflow.bloqueio.semMotivo',
        })
      }

      // Atrasados
      if (etapaAtual?.estaAtrasado) {
        metrics.atrasados++
        metrics.projetosAtrasados.push({
          id: state.projetoId,
          codigo: state.codigoOficial,
          cliente: state.clienteNome,
          etapa: state.etapaAtualId,
          diasAtraso: etapaAtual.diasAtraso,
        })
      }

      // Aguardando ação
      if (etapaAtual?.status === 'AGUARDANDO') {
        metrics.aguardandoAcao++
      }

      // Tempo médio por etapa (simplificado — baseado em SLA)
      if (stepDef && !metrics.tempoMedioPorEtapa[state.etapaAtualId]) {
        metrics.tempoMedioPorEtapa[state.etapaAtualId] = stepDef.slaDias
      }

      // Tempo médio por responsável
      if (stepDef) {
        const resp = stepDef.responsavel
        metrics.tempoMedioPorResponsavel[resp] =
          (metrics.tempoMedioPorResponsavel[resp] ?? 0) + stepDef.slaDias
      }
    }

    return metrics
  },

  /**
   * Retorna a lista de steps com seus status para um projeto
   */
  getStepsStatus(projetoId: string): Array<{
    step: (typeof PIPELINE_STEPS)[number]
    state: PipelineStepState
  }> {
    const state = projectStates.get(projetoId)
    return PIPELINE_STEPS.map((step) => ({
      step,
      state: state?.etapas[step.id] ?? {
        stepId: step.id,
        status: 'PENDENTE' as PipelineStepStatus,
        checklistItems: step.checklistObrigatorio.map((item) => ({ id: item.id, done: false })),
        diasAtraso: 0,
        estaAtrasado: false,
      },
    }))
  },
}
