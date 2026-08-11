/**
 * Definição das 17 etapas do pipeline operacional RIAGRO
 */

import { WORKFLOW_STATUS } from '@/shared/workflow/WorkflowTypes'
import type { PipelineStepDefinition } from './WorkflowPipelineTypes'

export const PIPELINE_STEPS: PipelineStepDefinition[] = [
  {
    id: 'LEAD',
    ordem: 1,
    workflowStatus: WORKFLOW_STATUS.LEAD,
    responsavel: 'COMERCIAL',
    slaDias: 2,
    dependencias: [],
    checklistObrigatorio: [
      { id: 'lead_contato', label: 'workflow.checklist.lead.contato', obrigatorio: true },
      { id: 'lead_interesse', label: 'workflow.checklist.lead.interesse', obrigatorio: true },
    ],
    anexosObrigatorios: [],
    notificarResponsavel: true,
  },
  {
    id: 'CLIENTE',
    ordem: 2,
    workflowStatus: WORKFLOW_STATUS.CLIENTE,
    responsavel: 'COMERCIAL',
    slaDias: 1,
    dependencias: ['LEAD'],
    checklistObrigatorio: [
      { id: 'cliente_cadastro', label: 'workflow.checklist.cliente.cadastro', obrigatorio: true },
      { id: 'cliente_contato', label: 'workflow.checklist.cliente.contato', obrigatorio: true },
    ],
    anexosObrigatorios: [],
    notificarResponsavel: true,
  },
  {
    id: 'VISITA_AGENDADA',
    ordem: 3,
    workflowStatus: WORKFLOW_STATUS.VISITA,
    responsavel: 'COMERCIAL',
    slaDias: 2,
    dependencias: ['CLIENTE'],
    checklistObrigatorio: [
      { id: 'visita_agendamento', label: 'workflow.checklist.visita.agendamento', obrigatorio: true },
      { id: 'visita_confirmacao', label: 'workflow.checklist.visita.confirmacao', obrigatorio: false },
    ],
    anexosObrigatorios: [],
    notificarResponsavel: true,
  },
  {
    id: 'VISITA_REALIZADA',
    ordem: 4,
    workflowStatus: WORKFLOW_STATUS.LEVANTAMENTO,
    responsavel: 'COMERCIAL',
    slaDias: 2,
    dependencias: ['VISITA_AGENDADA'],
    checklistObrigatorio: [
      { id: 'visita_relatorio', label: 'workflow.checklist.visita.relatorio', obrigatorio: true },
      { id: 'visita_fotos', label: 'workflow.checklist.visita.fotos', obrigatorio: false },
      { id: 'visita_resultado', label: 'workflow.checklist.visita.resultado', obrigatorio: true },
    ],
    anexosObrigatorios: [],
    notificarResponsavel: true,
  },
  {
    id: 'LEVANTAMENTO',
    ordem: 5,
    workflowStatus: WORKFLOW_STATUS.AGUARDANDO_ENGENHARIA,
    responsavel: 'COMERCIAL',
    slaDias: 2,
    dependencias: ['VISITA_REALIZADA'],
    checklistObrigatorio: [
      { id: 'levant_dados', label: 'workflow.checklist.levantamento.dados', obrigatorio: true },
      { id: 'levant_gps', label: 'workflow.checklist.levantamento.gps', obrigatorio: false },
      { id: 'levant_enviado', label: 'workflow.checklist.levantamento.enviado', obrigatorio: true },
    ],
    anexosObrigatorios: ['TECNICO'],
    notificarResponsavel: true,
  },
  {
    id: 'PROJETO_ENGENHARIA',
    ordem: 6,
    workflowStatus: WORKFLOW_STATUS.EM_PROJETO,
    responsavel: 'ENGENHARIA',
    slaDias: 5,
    dependencias: ['LEVANTAMENTO'],
    checklistObrigatorio: [
      { id: 'eng_planta', label: 'workflow.checklist.engenharia.planta', obrigatorio: true },
      { id: 'eng_dimensionamento', label: 'workflow.checklist.engenharia.dimensionamento', obrigatorio: true },
      { id: 'eng_revisao', label: 'workflow.checklist.engenharia.revisao', obrigatorio: false },
    ],
    anexosObrigatorios: ['TECNICO'],
    notificarResponsavel: true,
  },
  {
    id: 'MEMORIAL',
    ordem: 7,
    workflowStatus: WORKFLOW_STATUS.AGUARDANDO_MEMORIAL,
    responsavel: 'ENGENHARIA',
    slaDias: 3,
    dependencias: ['PROJETO_ENGENHARIA'],
    checklistObrigatorio: [
      { id: 'mem_descritivo', label: 'workflow.checklist.memorial.descritivo', obrigatorio: true },
      { id: 'mem_materiais', label: 'workflow.checklist.memorial.materiais', obrigatorio: true },
      { id: 'mem_aprovado', label: 'workflow.checklist.memorial.aprovado', obrigatorio: true },
    ],
    anexosObrigatorios: ['TECNICO', 'DOCUMENTACAO'],
    notificarResponsavel: true,
  },
  {
    id: 'APRESENTACAO',
    ordem: 8,
    workflowStatus: WORKFLOW_STATUS.APRESENTACAO,
    responsavel: 'COMERCIAL',
    slaDias: 2,
    dependencias: ['MEMORIAL'],
    checklistObrigatorio: [
      { id: 'apres_material', label: 'workflow.checklist.apresentacao.material', obrigatorio: true },
      { id: 'apres_realizada', label: 'workflow.checklist.apresentacao.realizada', obrigatorio: true },
      { id: 'apres_feedback', label: 'workflow.checklist.apresentacao.feedback', obrigatorio: false },
    ],
    anexosObrigatorios: ['DOCUMENTACAO'],
    notificarResponsavel: true,
  },
  {
    id: 'NEGOCIACAO',
    ordem: 9,
    workflowStatus: WORKFLOW_STATUS.NEGOCIACAO,
    responsavel: 'COMERCIAL',
    slaDias: 5,
    dependencias: ['APRESENTACAO'],
    checklistObrigatorio: [
      { id: 'neg_proposta', label: 'workflow.checklist.negociacao.proposta', obrigatorio: true },
      { id: 'neg_contraproposta', label: 'workflow.checklist.negociacao.contraproposta', obrigatorio: false },
    ],
    anexosObrigatorios: ['FINANCEIRO'],
    notificarResponsavel: false,
  },
  {
    id: 'VENDA',
    ordem: 10,
    workflowStatus: WORKFLOW_STATUS.VENDIDO,
    responsavel: 'COMERCIAL',
    slaDias: 1,
    dependencias: ['NEGOCIACAO'],
    checklistObrigatorio: [
      { id: 'venda_contrato', label: 'workflow.checklist.venda.contrato', obrigatorio: true },
      { id: 'venda_assinado', label: 'workflow.checklist.venda.assinado', obrigatorio: true },
    ],
    anexosObrigatorios: ['FINANCEIRO', 'DOCUMENTACAO'],
    notificarResponsavel: true,
  },
  {
    id: 'LIBERACAO_FINANCEIRA',
    ordem: 11,
    workflowStatus: WORKFLOW_STATUS.LIBERACAO_FINANCEIRA,
    responsavel: 'FINANCEIRO',
    slaDias: 3,
    dependencias: ['VENDA'],
    checklistObrigatorio: [
      { id: 'fin_aprovacao', label: 'workflow.checklist.financeiro.aprovacao', obrigatorio: true },
      { id: 'fin_documentos', label: 'workflow.checklist.financeiro.documentos', obrigatorio: true },
      { id: 'fin_liberado', label: 'workflow.checklist.financeiro.liberado', obrigatorio: true },
    ],
    anexosObrigatorios: ['FINANCEIRO'],
    notificarResponsavel: true,
  },
  {
    id: 'ORDEM_OBRA',
    ordem: 12,
    workflowStatus: WORKFLOW_STATUS.OBRA,
    responsavel: 'OBRAS',
    slaDias: 2,
    dependencias: ['LIBERACAO_FINANCEIRA'],
    checklistObrigatorio: [
      { id: 'obra_os', label: 'workflow.checklist.obra.os', obrigatorio: true },
      { id: 'obra_equipe', label: 'workflow.checklist.obra.equipe', obrigatorio: true },
      { id: 'obra_inicio', label: 'workflow.checklist.obra.inicio', obrigatorio: false },
    ],
    anexosObrigatorios: ['TECNICO'],
    notificarResponsavel: true,
  },
  {
    id: 'EXECUCAO',
    ordem: 13,
    workflowStatus: WORKFLOW_STATUS.OBRA,
    responsavel: 'OBRAS',
    slaDias: 15,
    dependencias: ['ORDEM_OBRA'],
    checklistObrigatorio: [
      { id: 'exec_diario', label: 'workflow.checklist.execucao.diario', obrigatorio: false },
      { id: 'exec_fotos', label: 'workflow.checklist.execucao.fotos', obrigatorio: true },
      { id: 'exec_teste', label: 'workflow.checklist.execucao.teste', obrigatorio: true },
    ],
    anexosObrigatorios: ['MIDIA', 'TECNICO'],
    notificarResponsavel: false,
  },
  {
    id: 'ENTREGA_TECNICA',
    ordem: 14,
    workflowStatus: WORKFLOW_STATUS.ENTREGUE,
    responsavel: 'OBRAS',
    slaDias: 3,
    dependencias: ['EXECUCAO'],
    checklistObrigatorio: [
      { id: 'entrega_checklist', label: 'workflow.checklist.entrega.checklist', obrigatorio: true },
      { id: 'entrega_assinatura', label: 'workflow.checklist.entrega.assinatura', obrigatorio: true },
      { id: 'entrega_docs', label: 'workflow.checklist.entrega.docs', obrigatorio: true },
    ],
    anexosObrigatorios: ['DOCUMENTACAO', 'TECNICO'],
    notificarResponsavel: true,
  },
  {
    id: 'TREINAMENTO',
    ordem: 15,
    workflowStatus: WORKFLOW_STATUS.TREINAMENTO,
    responsavel: 'ASSISTENCIA',
    slaDias: 2,
    dependencias: ['ENTREGA_TECNICA'],
    checklistObrigatorio: [
      { id: 'trein_realizado', label: 'workflow.checklist.treinamento.realizado', obrigatorio: true },
      { id: 'trein_manual', label: 'workflow.checklist.treinamento.manual', obrigatorio: false },
      { id: 'trein_assinado', label: 'workflow.checklist.treinamento.assinado', obrigatorio: true },
    ],
    anexosObrigatorios: [],
    notificarResponsavel: true,
  },
  {
    id: 'POS_VENDA',
    ordem: 16,
    workflowStatus: WORKFLOW_STATUS.ASSISTENCIA,
    responsavel: 'ASSISTENCIA',
    slaDias: 5,
    dependencias: ['TREINAMENTO'],
    checklistObrigatorio: [
      { id: 'pos_contato', label: 'workflow.checklist.posvenda.contato', obrigatorio: true },
      { id: 'pos_satisfacao', label: 'workflow.checklist.posvenda.satisfacao', obrigatorio: false },
    ],
    anexosObrigatorios: [],
    notificarResponsavel: false,
  },
  {
    id: 'FINALIZADO',
    ordem: 17,
    workflowStatus: WORKFLOW_STATUS.FINALIZADO,
    responsavel: 'ADMINISTRADOR',
    slaDias: 0,
    dependencias: ['POS_VENDA'],
    checklistObrigatorio: [
      { id: 'final_avaliacao', label: 'workflow.checklist.finalizado.avaliacao', obrigatorio: false },
      { id: 'final_encerrado', label: 'workflow.checklist.finalizado.encerrado', obrigatorio: true },
    ],
    anexosObrigatorios: [],
    notificarResponsavel: true,
  },
]

export const PIPELINE_STEP_MAP = Object.fromEntries(
  PIPELINE_STEPS.map((step) => [step.id, step])
) as Record<string, PipelineStepDefinition>

export const PIPELINE_STEP_BY_STATUS = PIPELINE_STEPS.reduce<Record<string, PipelineStepDefinition>>(
  (acc, step) => {
    acc[step.workflowStatus] = step
    return acc
  },
  {}
)
