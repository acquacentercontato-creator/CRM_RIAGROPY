/**
 * Tipos do módulo Assistência Técnica
 */

export const ASSISTENCIA_STATUS = [
  'CHAMADO',
  'TRIAGEM',
  'AGENDAMENTO',
  'TECNICO_CAMPO',
  'VALIDACAO',
  'FINALIZADO',
  'GARANTIA',
  'CANCELADO',
] as const

export type AssistenciaStatus = (typeof ASSISTENCIA_STATUS)[number]

export type AssistenciaPrioridade = 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE'

export type AssistenciaTipo = 'PREVENTIVA' | 'CORRETIVA' | 'GARANTIA' | 'INSTALACAO' | 'TREINAMENTO'

export interface AssistenciaChamado {
  id: string
  codigo: string
  clienteId: string
  clienteNome: string
  obraId?: string
  projetoId?: string
  tipo: AssistenciaTipo
  prioridade: AssistenciaPrioridade
  status: AssistenciaStatus
  descricao: string
  responsavel?: string
  tecnico?: string
  dataAbertura: string
  dataAgendamento?: string
  dataAtendimento?: string
  dataFechamento?: string
  slaHoras: number
  checklist: AssistenciaChecklistItem[]
  historico: AssistenciaHistoricoItem[]
  pecasUtilizadas?: string[]
  observacoes?: string
  satisfacaoCliente?: number
  createdAt: string
  updatedAt: string
}

export interface AssistenciaChecklistItem {
  id: string
  label: string
  done: boolean
  obrigatorio: boolean
}

export interface AssistenciaHistoricoItem {
  id: string
  status: AssistenciaStatus
  descricao: string
  responsavel: string
  timestamp: string
}

export const SLA_POR_PRIORIDADE: Record<AssistenciaPrioridade, number> = {
  URGENTE: 4,
  ALTA: 8,
  MEDIA: 24,
  BAIXA: 48,
}
