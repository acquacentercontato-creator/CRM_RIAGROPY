/**
 * Tipos do workflow pipeline operacional de 17 etapas
 */

import type { WorkflowStatus } from '@/shared/workflow/WorkflowTypes'

export type PipelineStepStatus =
  | 'PENDENTE'
  | 'EM_ANDAMENTO'
  | 'AGUARDANDO'
  | 'BLOQUEADO'
  | 'CONCLUIDO'
  | 'CANCELADO'

export type PipelineResponsavel =
  | 'COMERCIAL'
  | 'ENGENHARIA'
  | 'FINANCEIRO'
  | 'OBRAS'
  | 'ASSISTENCIA'
  | 'ADMINISTRADOR'

export interface PipelineChecklistItem {
  id: string
  label: string
  obrigatorio: boolean
}

export interface PipelineStepDefinition {
  id: string
  ordem: number
  workflowStatus: WorkflowStatus
  responsavel: PipelineResponsavel
  slaDias: number         // prazo em dias após ativação
  dependencias: string[]  // ids de steps que devem estar CONCLUIDO
  checklistObrigatorio: PipelineChecklistItem[]
  anexosObrigatorios: string[]  // categorias de anexos obrigatórios
  notificarResponsavel: boolean
}

export interface PipelineStepState {
  stepId: string
  status: PipelineStepStatus
  dataInicio?: string
  dataConclusao?: string
  dataLimite?: string
  responsavelAtual?: string
  checklistItems: Array<{ id: string; done: boolean }>
  observacoes?: string
  diasAtraso: number
  estaAtrasado: boolean
}

export interface PipelineProjectState {
  projetoId: string
  codigoOficial: string
  clienteNome: string
  etapaAtualId: string
  etapas: Record<string, PipelineStepState>
  createdAt: string
  updatedAt: string
}

export interface PipelineMetrics {
  totalProjetos: number
  porEtapa: Record<string, number>
  bloqueados: number
  atrasados: number
  aguardandoAcao: number
  tempoMedioPorEtapa: Record<string, number>   // dias
  tempoMedioPorResponsavel: Record<string, number> // dias
  projetosBloqueados: Array<{ id: string; codigo: string; cliente: string; etapa: string; motivo: string }>
  projetosAtrasados: Array<{ id: string; codigo: string; cliente: string; etapa: string; diasAtraso: number }>
}

export interface PipelineTransitionResult {
  ok: boolean
  bloqueios: string[]
  checklistPendentes: string[]
  dependenciasNaoConcluidas: string[]
}
