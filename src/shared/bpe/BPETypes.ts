/**
 * Tipos centrais do Business Process Engine (BPE)
 */

import type { WorkflowStatus } from '@/shared/workflow/WorkflowTypes'
import type { AppRole } from '@/shared/types/auth'

// ── Triggers ──────────────────────────────────────────────────────────────────

export type BPETriggerType =
  | 'ETAPA_CONCLUIDA'
  | 'ARQUIVO_ANEXADO'
  | 'RESPONSAVEL_ALTERADO'
  | 'PRAZO_VENCIDO'
  | 'APROVADO'
  | 'REPROVADO'
  | 'CANCELADO'
  | 'CRIADO'
  | 'ATUALIZADO'

export interface BPETriggerPayload {
  projetoId: string
  codigoOficial: string
  usuarioId?: string
  usuarioNome?: string
  statusAnterior?: WorkflowStatus | null
  statusNovo?: WorkflowStatus
  etapa?: string
  metadados?: Record<string, unknown>
  timestamp: string
}

export interface BPETrigger {
  id: string
  tipo: BPETriggerType
  descricao?: string
  condicoes: BPEConditionId[]  // todas devem ser verdadeiras para disparar
  acoes: BPEActionId[]          // executar em sequência
  ativo: boolean
}

// ── Conditions ────────────────────────────────────────────────────────────────

export type BPEConditionId =
  | 'POSSUI_ANEXOS_OBRIGATORIOS'
  | 'CHECKLIST_COMPLETO'
  | 'RESPONSAVEL_DEFINIDO'
  | 'PRAZO_VALIDO'
  | 'VENDA_APROVADA'
  | 'PAGAMENTO_LIBERADO'
  | 'APROVACAO_ENGENHARIA'
  | 'APROVACAO_FINANCEIRO'
  | 'APROVACAO_GERENCIA'
  | 'APROVACAO_OBRAS'
  | 'APROVACAO_ASSISTENCIA'
  | 'SEM_BLOQUEIO'

export interface BPEConditionContext {
  projetoId: string
  etapa?: string
  statusAtual?: WorkflowStatus
  metadados?: Record<string, unknown>
}

// ── Actions ───────────────────────────────────────────────────────────────────

export type BPEActionId =
  | 'CRIAR_TAREFA'
  | 'ALTERAR_RESPONSAVEL'
  | 'CRIAR_NOTIFICACAO'
  | 'ENVIAR_ALERTA'
  | 'ALTERAR_STATUS'
  | 'CRIAR_TIMELINE'
  | 'CRIAR_AUDITORIA'
  | 'CRIAR_CHECKLIST'
  | 'CRIAR_ORDEM'
  | 'MOVER_PIPELINE'
  | 'ATUALIZAR_DASHBOARD'
  | 'CRIAR_SLA'
  | 'SOLICITAR_APROVACAO'

export interface BPEActionParams {
  notificacaoTitulo?: string
  notificacaoMensagem?: string
  alertaNivel?: 'info' | 'warning' | 'error'
  novoResponsavelRole?: AppRole
  novoStatus?: WorkflowStatus
  timelineAcao?: string
  checklistItems?: string[]
  slaHoras?: number
  aprovacaoTipo?: BPEApprovalType
}

export interface BPEAction {
  id: BPEActionId
  params?: BPEActionParams
  descricao?: string
}

// ── Approvals ─────────────────────────────────────────────────────────────────

export type BPEApprovalType =
  | 'ENGENHARIA'
  | 'FINANCEIRO'
  | 'GERENCIA'
  | 'OBRAS'
  | 'ASSISTENCIA'

export type BPEApprovalStatus = 'PENDENTE' | 'APROVADO' | 'REPROVADO' | 'CANCELADO'

export interface BPEApproval {
  id: string
  projetoId: string
  codigoOficial: string
  clienteNome: string
  tipo: BPEApprovalType
  status: BPEApprovalStatus
  responsavelId?: string
  responsavelNome?: string
  responsavelRole?: AppRole
  solicitadoEm: string
  solicitadoPor: string
  respondidoEm?: string
  observacao?: string
  etapa?: string
}

// ── Rules ─────────────────────────────────────────────────────────────────────

export interface BPERule {
  id: string
  nome: string
  descricao?: string
  ativo: boolean
  prioridade: number
  gatilho: BPETriggerType
  condicoes: BPEConditionId[]
  acoes: BPEAction[]
  repetivel: boolean  // pode disparar mais de uma vez por projeto?
}

// ── Task ─────────────────────────────────────────────────────────────────────

export interface BPETask {
  id: string
  projetoId: string
  codigoOficial: string
  titulo: string
  descricao?: string
  responsavelRole: AppRole
  status: 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA'
  prazo?: string
  criadoEm: string
  criadoPor: string
  etapa?: string
}

// ── BPE Context ───────────────────────────────────────────────────────────────

export interface BPEExecutionContext {
  projetoId: string
  codigoOficial: string
  clienteNome: string
  etapa?: string
  trigger: BPETriggerType
  payload: BPETriggerPayload
  aprovacoes: Record<BPEApprovalType, BPEApprovalStatus>
  checklistCompleto: boolean
  possuiAnexos: boolean
  responsavelDefinido: boolean
}

// ── BPE Metrics (para dashboard) ─────────────────────────────────────────────

export interface BPEDashboardMetrics {
  aguardandoAprovacao: BPEApproval[]
  aguardandoResponsavel: Array<{ projetoId: string; codigo: string; etapa: string }>
  bloqueados: Array<{ projetoId: string; codigo: string; motivo: string }>
  semMovimentacao: Array<{ projetoId: string; codigo: string; diasParado: number }>
  slaVencido: Array<{ projetoId: string; codigo: string; etapa: string; diasAtraso: number }>
  totalTarefas: number
  tarefasPendentes: number
}
