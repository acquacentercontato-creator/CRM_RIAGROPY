/**
 * Regras de automação do CRM — 10 fluxos de negócio
 */

import type { CRMStatusChangedPayload } from './WorkflowEventBus'

// ── Types ──────────────────────────────────────────────────────────────────

export type AutomationActionType =
  | 'CRIAR_TAREFA'
  | 'AGENDAR_FOLLOWUP'
  | 'NOTIFICAR'
  | 'REGISTRAR_TIMELINE'
  | 'REGISTRAR_AUDITORIA'
  | 'ATUALIZAR_DASHBOARD'
  | 'DEFINIR_SLA'
  | 'ATRIBUIR_RESPONSAVEL'
  | 'ATIVAR_CHECKLIST'
  | 'ATIVAR_UPLOAD'
  | 'GERAR_DOCUMENTO'
  | 'DISPARAR_EVENTO'

export interface AutomationAction {
  tipo: AutomationActionType
  params?: {
    titulo?: string
    mensagem?: string
    notificarRole?: string[]
    responsavelRole?: string
    slaHoras?: number
    eventoTipo?: string
    checklistItems?: string[]
    documentoTipo?: string
  }
}

export interface AutomationRule {
  id: string
  nome: string
  descricao: string
  ativo: boolean
  prioridade: number
  gatilho: {
    entityType?: string
    statusAnterior?: string | string[]
    statusNovo: string | string[]
  }
  acoes: AutomationAction[]
}

// ── Helpers ────────────────────────────────────────────────────────────────

const matchStatus = (rule: AutomationRule, payload: CRMStatusChangedPayload): boolean => {
  if (rule.gatilho.entityType && rule.gatilho.entityType !== payload.entityType) return false

  const matchNovo = Array.isArray(rule.gatilho.statusNovo)
    ? rule.gatilho.statusNovo.includes(payload.statusNovo)
    : rule.gatilho.statusNovo === payload.statusNovo

  if (!matchNovo) return false

  if (rule.gatilho.statusAnterior) {
    const matchAnterior = Array.isArray(rule.gatilho.statusAnterior)
      ? rule.gatilho.statusAnterior.includes(payload.statusAnterior)
      : rule.gatilho.statusAnterior === payload.statusAnterior
    if (!matchAnterior) return false
  }

  return true
}

let _extraRules: AutomationRule[] = []

export const registerAdditionalRules = (rules: AutomationRule[]): void => {
  _extraRules = [..._extraRules, ...rules]
}

export const findMatchingRules = (payload: CRMStatusChangedPayload): AutomationRule[] => {
  const all = [...CRM_AUTOMATION_RULES, ..._extraRules]
  return all
    .filter((rule) => rule.ativo && matchStatus(rule, payload))
    .sort((a, b) => a.prioridade - b.prioridade)
}

// ── Rules ──────────────────────────────────────────────────────────────────

export const CRM_AUTOMATION_RULES: AutomationRule[] = [
  // FLOW 1: Lead criado → tarefa comercial + follow-up + dashboard + histórico
  {
    id: 'F01_LEAD_CRIADO',
    nome: 'Lead criado',
    descricao: 'Cliente cadastrado como Lead — gera tarefa comercial e agenda follow-up',
    ativo: true,
    prioridade: 1,
    gatilho: { entityType: 'CLIENTE', statusNovo: 'LEAD' },
    acoes: [
      { tipo: 'CRIAR_TAREFA', params: { titulo: 'automation.tasks.contatarLead', responsavelRole: 'COMERCIAL', slaHoras: 24 } },
      { tipo: 'AGENDAR_FOLLOWUP', params: { titulo: 'automation.followup.primeiroContato', slaHoras: 48 } },
      { tipo: 'ATUALIZAR_DASHBOARD' },
      { tipo: 'REGISTRAR_TIMELINE', params: { mensagem: 'automation.timeline.leadCriado' } },
      { tipo: 'REGISTRAR_AUDITORIA' },
    ],
  },

  // FLOW 2: Prospect (visita agendada) → preparar visita
  {
    id: 'F02_PROSPECT_VISITA',
    nome: 'Prospect — Visita agendada',
    descricao: 'Prospect com visita agendada — prepara checklist e notifica equipe',
    ativo: true,
    prioridade: 2,
    gatilho: { entityType: 'VISITA', statusNovo: 'PENDENTE' },
    acoes: [
      { tipo: 'ATIVAR_CHECKLIST', params: { checklistItems: ['automation.checklist.prepararMaterial', 'automation.checklist.confirmarVisita'] } },
      { tipo: 'NOTIFICAR', params: { titulo: 'automation.notif.visitaAgendada', notificarRole: ['COMERCIAL'] } },
      { tipo: 'REGISTRAR_TIMELINE', params: { mensagem: 'automation.timeline.visitaAgendada' } },
    ],
  },

  // FLOW 3: Visita concluída → criar Levantamento + notificar Engenharia + timeline
  {
    id: 'F03_VISITA_CONCLUIDA',
    nome: 'Visita concluída',
    descricao: 'Visita realizada — cria levantamento e notifica Engenharia',
    ativo: true,
    prioridade: 1,
    gatilho: { entityType: 'VISITA', statusNovo: 'CONCLUIDO' },
    acoes: [
      { tipo: 'CRIAR_TAREFA', params: { titulo: 'automation.tasks.criarLevantamento', responsavelRole: 'COMERCIAL', slaHoras: 48 } },
      { tipo: 'NOTIFICAR', params: { titulo: 'automation.notif.visitaConcluida', notificarRole: ['ENGENHARIA', 'COMERCIAL'] } },
      { tipo: 'REGISTRAR_TIMELINE', params: { mensagem: 'automation.timeline.visitaConcluida' } },
      { tipo: 'REGISTRAR_AUDITORIA' },
      { tipo: 'ATUALIZAR_DASHBOARD' },
    ],
  },

  // FLOW 4: Levantamento concluído → criar Projeto + atribuir Projetista + SLA + dashboard
  {
    id: 'F04_LEVANTAMENTO_CONCLUIDO',
    nome: 'Levantamento concluído',
    descricao: 'Levantamento enviado para Engenharia — cria projeto e define SLA',
    ativo: true,
    prioridade: 1,
    gatilho: { entityType: 'LEVANTAMENTO', statusNovo: ['ENVIADO_ENGENHARIA', 'APROVADO_ENGENHARIA'] },
    acoes: [
      { tipo: 'CRIAR_TAREFA', params: { titulo: 'automation.tasks.criarProjeto', responsavelRole: 'ENGENHARIA', slaHoras: 120 } },
      { tipo: 'ATRIBUIR_RESPONSAVEL', params: { responsavelRole: 'ENGENHARIA' } },
      { tipo: 'DEFINIR_SLA', params: { slaHoras: 120 } },
      { tipo: 'NOTIFICAR', params: { titulo: 'automation.notif.levantamentoConcluido', notificarRole: ['ENGENHARIA'] } },
      { tipo: 'REGISTRAR_TIMELINE', params: { mensagem: 'automation.timeline.levantamentoConcluido' } },
      { tipo: 'ATUALIZAR_DASHBOARD' },
    ],
  },

  // FLOW 5: Projeto concluído → criar Memorial + notificar Comercial + timeline
  {
    id: 'F05_PROJETO_CONCLUIDO',
    nome: 'Projeto concluído',
    descricao: 'Projeto concluído — cria memorial descritivo e notifica Comercial',
    ativo: true,
    prioridade: 1,
    gatilho: { entityType: 'PROJETO', statusNovo: 'PROJETO COMPLETO' },
    acoes: [
      { tipo: 'CRIAR_TAREFA', params: { titulo: 'automation.tasks.criarMemorial', responsavelRole: 'ENGENHARIA', slaHoras: 72 } },
      { tipo: 'NOTIFICAR', params: { titulo: 'automation.notif.projetoConcluido', notificarRole: ['COMERCIAL', 'ENGENHARIA'] } },
      { tipo: 'REGISTRAR_TIMELINE', params: { mensagem: 'automation.timeline.projetoConcluido' } },
      { tipo: 'ATUALIZAR_DASHBOARD' },
    ],
  },

  // FLOW 6: Memorial aprovado → liberar Apresentação + timeline + dashboard
  {
    id: 'F06_MEMORIAL_APROVADO',
    nome: 'Memorial aprovado',
    descricao: 'Memorial aprovado pelo gerente — libera apresentação ao cliente',
    ativo: true,
    prioridade: 1,
    gatilho: { entityType: 'PROJETO', statusNovo: 'AGUARDANDO MEMORIAL' },
    acoes: [
      { tipo: 'CRIAR_TAREFA', params: { titulo: 'automation.tasks.agendarApresentacao', responsavelRole: 'COMERCIAL', slaHoras: 48 } },
      { tipo: 'NOTIFICAR', params: { titulo: 'automation.notif.memorialAprovado', notificarRole: ['COMERCIAL'] } },
      { tipo: 'REGISTRAR_TIMELINE', params: { mensagem: 'automation.timeline.memorialAprovado' } },
      { tipo: 'ATUALIZAR_DASHBOARD' },
    ],
  },

  // FLOW 7: Venda confirmada → criar Obra + notificar Financeiro + cronograma + timeline
  {
    id: 'F07_VENDA_CONFIRMADA',
    nome: 'Venda confirmada',
    descricao: 'Venda confirmada — cria ordem de obra, notifica Financeiro e define cronograma',
    ativo: true,
    prioridade: 1,
    gatilho: { entityType: 'OPORTUNIDADE', statusNovo: 'FECHAMENTO' },
    acoes: [
      { tipo: 'CRIAR_TAREFA', params: { titulo: 'automation.tasks.criarObra', responsavelRole: 'OBRAS', slaHoras: 48 } },
      { tipo: 'NOTIFICAR', params: { titulo: 'automation.notif.vendaConfirmada', notificarRole: ['FINANCEIRO', 'OBRAS', 'ADMINISTRADOR'] } },
      { tipo: 'GERAR_DOCUMENTO', params: { documentoTipo: 'ORDEM_OBRA' } },
      { tipo: 'DEFINIR_SLA', params: { slaHoras: 48 } },
      { tipo: 'REGISTRAR_TIMELINE', params: { mensagem: 'automation.timeline.vendaConfirmada' } },
      { tipo: 'ATUALIZAR_DASHBOARD' },
    ],
  },

  // FLOW 8: Obra iniciada → ativar Diário + Upload + Checklist + dashboard
  {
    id: 'F08_OBRA_INICIADA',
    nome: 'Obra iniciada',
    descricao: 'Obra iniciada em campo — ativa diário, uploads e checklist',
    ativo: true,
    prioridade: 1,
    gatilho: { entityType: 'OBRA', statusNovo: ['EXECUCAO', 'PLANEJAMENTO'] },
    acoes: [
      { tipo: 'ATIVAR_CHECKLIST', params: { checklistItems: ['automation.checklist.equipamentos', 'automation.checklist.seguranca', 'automation.checklist.materiais'] } },
      { tipo: 'ATIVAR_UPLOAD' },
      { tipo: 'NOTIFICAR', params: { titulo: 'automation.notif.obraIniciada', notificarRole: ['OBRAS', 'ADMINISTRADOR'] } },
      { tipo: 'REGISTRAR_TIMELINE', params: { mensagem: 'automation.timeline.obraIniciada' } },
      { tipo: 'ATUALIZAR_DASHBOARD' },
    ],
  },

  // FLOW 9: Obra concluída → gerar Entrega + Assinatura + Fotos + timeline
  {
    id: 'F09_OBRA_CONCLUIDA',
    nome: 'Obra concluída',
    descricao: 'Obra concluída — gera entrega técnica, solicita assinatura e fotos finais',
    ativo: true,
    prioridade: 1,
    gatilho: { entityType: 'OBRA', statusNovo: ['ENTREGA', 'ENCERRAMENTO'] },
    acoes: [
      { tipo: 'CRIAR_TAREFA', params: { titulo: 'automation.tasks.gerarEntrega', responsavelRole: 'OBRAS', slaHoras: 24 } },
      { tipo: 'ATIVAR_CHECKLIST', params: { checklistItems: ['automation.checklist.assinatura', 'automation.checklist.fotosFinais', 'automation.checklist.documentos'] } },
      { tipo: 'ATIVAR_UPLOAD' },
      { tipo: 'NOTIFICAR', params: { titulo: 'automation.notif.obraConcluida', notificarRole: ['OBRAS', 'COMERCIAL', 'ADMINISTRADOR'] } },
      { tipo: 'REGISTRAR_TIMELINE', params: { mensagem: 'automation.timeline.obraConcluida' } },
      { tipo: 'ATUALIZAR_DASHBOARD' },
    ],
  },

  // FLOW 10: Entrega concluída → abrir Garantia + ativar Assistência + dashboard
  {
    id: 'F10_ENTREGA_CONCLUIDA',
    nome: 'Entrega concluída',
    descricao: 'Entrega técnica concluída — abre garantia e ativa assistência pós-venda',
    ativo: true,
    prioridade: 1,
    gatilho: { entityType: 'ENTREGA', statusNovo: 'CONCLUIDO' },
    acoes: [
      { tipo: 'CRIAR_TAREFA', params: { titulo: 'automation.tasks.abrirGarantia', responsavelRole: 'ASSISTENCIA', slaHoras: 24 } },
      { tipo: 'AGENDAR_FOLLOWUP', params: { titulo: 'automation.followup.posVenda', slaHoras: 168 } },
      { tipo: 'NOTIFICAR', params: { titulo: 'automation.notif.entregaConcluida', notificarRole: ['ASSISTENCIA', 'COMERCIAL', 'ADMINISTRADOR'] } },
      { tipo: 'REGISTRAR_TIMELINE', params: { mensagem: 'automation.timeline.entregaConcluida' } },
      { tipo: 'DISPARAR_EVENTO', params: { eventoTipo: 'crm.workflow.completed' } },
      { tipo: 'ATUALIZAR_DASHBOARD' },
    ],
  },
]

export const AUTOMATION_RULES_MAP = Object.fromEntries(
  CRM_AUTOMATION_RULES.map((r) => [r.id, r])
) as Record<string, AutomationRule>
