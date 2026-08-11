/**
 * Definição das regras de negócio padrão do BPE
 */

import type { BPERule } from './BPETypes'

export const BPE_DEFAULT_RULES: BPERule[] = [
  // ── Ao concluir uma etapa ─────────────────────────────────────────────────
  {
    id: 'R001_ETAPA_CONCLUIDA_TIMELINE',
    nome: 'Registrar timeline ao concluir etapa',
    ativo: true,
    prioridade: 1,
    gatilho: 'ETAPA_CONCLUIDA',
    condicoes: [],
    acoes: [
      { id: 'CRIAR_TIMELINE', params: { timelineAcao: 'ETAPA_CONCLUIDA' } },
      { id: 'CRIAR_AUDITORIA' },
    ],
    repetivel: true,
  },
  {
    id: 'R002_ETAPA_CONCLUIDA_NOTIFICAR',
    nome: 'Notificar responsavel ao concluir etapa',
    ativo: true,
    prioridade: 2,
    gatilho: 'ETAPA_CONCLUIDA',
    condicoes: [],
    acoes: [
      {
        id: 'CRIAR_NOTIFICACAO',
        params: { notificacaoTitulo: 'bpe.notif.etapaConcluida', notificacaoMensagem: 'bpe.notif.etapaConcluida' },
      },
    ],
    repetivel: true,
  },
  {
    id: 'R003_ETAPA_CONCLUIDA_PROXIMA_TAREFA',
    nome: 'Criar tarefa para proxima etapa',
    ativo: true,
    prioridade: 3,
    gatilho: 'ETAPA_CONCLUIDA',
    condicoes: ['SEM_BLOQUEIO'],
    acoes: [
      { id: 'CRIAR_TAREFA', params: { notificacaoTitulo: 'bpe.tarefa.proximaEtapa', slaHoras: 48 } },
    ],
    repetivel: true,
  },

  // ── Ao anexar arquivo ─────────────────────────────────────────────────────
  {
    id: 'R004_ARQUIVO_ANEXADO_TIMELINE',
    nome: 'Registrar timeline ao anexar arquivo',
    ativo: true,
    prioridade: 1,
    gatilho: 'ARQUIVO_ANEXADO',
    condicoes: [],
    acoes: [
      { id: 'CRIAR_TIMELINE', params: { timelineAcao: 'ARQUIVO_ANEXADO' } },
      { id: 'CRIAR_AUDITORIA' },
    ],
    repetivel: true,
  },

  // ── Ao alterar responsável ────────────────────────────────────────────────
  {
    id: 'R005_RESPONSAVEL_ALTERADO',
    nome: 'Notificar ao alterar responsavel',
    ativo: true,
    prioridade: 1,
    gatilho: 'RESPONSAVEL_ALTERADO',
    condicoes: [],
    acoes: [
      {
        id: 'CRIAR_NOTIFICACAO',
        params: { notificacaoTitulo: 'bpe.notif.responsavelAlterado', notificacaoMensagem: 'bpe.notif.responsavelAlterado' },
      },
      { id: 'CRIAR_AUDITORIA' },
    ],
    repetivel: true,
  },

  // ── Ao vencer prazo (SLA) ─────────────────────────────────────────────────
  {
    id: 'R006_PRAZO_VENCIDO_ALERTA',
    nome: 'Emitir alerta ao vencer SLA',
    ativo: true,
    prioridade: 1,
    gatilho: 'PRAZO_VENCIDO',
    condicoes: [],
    acoes: [
      { id: 'ENVIAR_ALERTA', params: { alertaNivel: 'error' } },
      { id: 'CRIAR_AUDITORIA' },
      {
        id: 'CRIAR_NOTIFICACAO',
        params: { notificacaoTitulo: 'bpe.notif.prazoVencido', notificacaoMensagem: 'bpe.notif.prazoVencido', alertaNivel: 'error' },
      },
    ],
    repetivel: false,
  },
  {
    id: 'R007_PRAZO_VENCIDO_GERENTE',
    nome: 'Notificar gerente ao vencer SLA',
    ativo: true,
    prioridade: 2,
    gatilho: 'PRAZO_VENCIDO',
    condicoes: [],
    acoes: [
      { id: 'CRIAR_TAREFA', params: { notificacaoTitulo: 'bpe.tarefa.prazoVencido', novoResponsavelRole: 'GERENTE' } },
    ],
    repetivel: false,
  },

  // ── Ao aprovar ────────────────────────────────────────────────────────────
  {
    id: 'R008_APROVADO_PIPELINE',
    nome: 'Avançar pipeline ao aprovar',
    ativo: true,
    prioridade: 1,
    gatilho: 'APROVADO',
    condicoes: ['CHECKLIST_COMPLETO'],
    acoes: [
      { id: 'MOVER_PIPELINE' },
      { id: 'CRIAR_TIMELINE', params: { timelineAcao: 'APROVACAO_CONCLUIDA' } },
      {
        id: 'CRIAR_NOTIFICACAO',
        params: { notificacaoTitulo: 'bpe.notif.aprovado', alertaNivel: 'info' },
      },
    ],
    repetivel: true,
  },

  // ── Ao reprovar ───────────────────────────────────────────────────────────
  {
    id: 'R009_REPROVADO_ALERTA',
    nome: 'Alertar ao reprovar aprovacao',
    ativo: true,
    prioridade: 1,
    gatilho: 'REPROVADO',
    condicoes: [],
    acoes: [
      { id: 'ENVIAR_ALERTA', params: { alertaNivel: 'warning' } },
      { id: 'CRIAR_TIMELINE', params: { timelineAcao: 'REPROVACAO' } },
      {
        id: 'CRIAR_NOTIFICACAO',
        params: { notificacaoTitulo: 'bpe.notif.reprovado', alertaNivel: 'warning' },
      },
    ],
    repetivel: true,
  },

  // ── Ao cancelar ───────────────────────────────────────────────────────────
  {
    id: 'R010_CANCELADO',
    nome: 'Registrar cancelamento',
    ativo: true,
    prioridade: 1,
    gatilho: 'CANCELADO',
    condicoes: [],
    acoes: [
      { id: 'CRIAR_TIMELINE', params: { timelineAcao: 'CANCELAMENTO' } },
      { id: 'CRIAR_AUDITORIA' },
      {
        id: 'CRIAR_NOTIFICACAO',
        params: { notificacaoTitulo: 'bpe.notif.cancelado', alertaNivel: 'error' },
      },
    ],
    repetivel: false,
  },

  // ── Solicitar aprovações automáticas por etapa ────────────────────────────
  {
    id: 'R011_SOLICITAR_APROVACAO_ENGENHARIA',
    nome: 'Solicitar aprovacao de Engenharia ao entrar em EM_PROJETO',
    ativo: true,
    prioridade: 1,
    gatilho: 'CRIADO',
    condicoes: [],
    acoes: [
      { id: 'SOLICITAR_APROVACAO', params: { aprovacaoTipo: 'ENGENHARIA' } },
    ],
    repetivel: false,
  },
  {
    id: 'R012_SOLICITAR_APROVACAO_FINANCEIRA',
    nome: 'Solicitar aprovacao financeira ao vender',
    ativo: true,
    prioridade: 1,
    gatilho: 'CRIADO',
    condicoes: [],
    acoes: [
      { id: 'SOLICITAR_APROVACAO', params: { aprovacaoTipo: 'FINANCEIRO' } },
      { id: 'SOLICITAR_APROVACAO', params: { aprovacaoTipo: 'GERENCIA' } },
    ],
    repetivel: false,
  },
]

export const BPE_RULES_MAP = Object.fromEntries(
  BPE_DEFAULT_RULES.map((r) => [r.id, r])
) as Record<string, BPERule>
