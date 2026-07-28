import type { TimelineEvent } from '@/shared/types/core'
import { WORKFLOW_STATUS, type WorkflowStatus } from '@/shared/workflow/WorkflowTypes'
import type { Obra, ObraActor, ObraForm, ObraStatus } from '@/modules/obras/types/obrasTypes'

export const nowIso = () => new Date().toISOString()

export const makeId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const buildCodigoObra = (items: Obra[]) => {
  const max = items.reduce((acc, item) => {
    const parsed = Number(item.codigoObra.replace('OBR-', ''))
    if (Number.isNaN(parsed)) return acc
    return Math.max(acc, parsed)
  }, 0)

  return `OBR-${String(max + 1).padStart(5, '0')}`
}

export const createTimelineEvent = (
  type: string,
  message: string,
  actor: ObraActor,
  nextStatus?: string,
  previousStatus?: string | null
): TimelineEvent => ({
  id: makeId(),
  type,
  message,
  actorId: actor.id,
  actorName: actor.name,
  createdAt: nowIso(),
  action: type,
  nextStatus,
  previousStatus,
})

export const createEmptyObraForm = (): ObraForm => ({
  clienteNome: '',
  projetoId: '',
  projetoNome: '',
  projetoTipo: 'A',
  responsavelObra: '',
  status: 'OBRA_CRIADA',
  dataCriacaoObra: new Date().toISOString().slice(0, 10),
  dataInicio: '',
  dataPrevista: '',
  dataEntrega: '',
  prioridade: 'MEDIA',
  observacoesPlanejamento: '',
  equipes: [],
  cronograma: [],
  diarioObra: [],
  checklist: {
    materiais: false,
    equipamentos: false,
    seguranca: false,
    testes: false,
    entrega: false,
  },
  entregaTecnica: {
    data: '',
    responsavel: '',
    assinatura: '',
    observacoes: '',
  },
  fotos: [],
  videos: [],
  documentos: [],
  pdfs: [],
})

export const mapObraStatusToWorkflow = (status: ObraStatus): WorkflowStatus => {
  if (status === 'ENTREGA' || status === 'ENCERRAMENTO') {
    return WORKFLOW_STATUS.ENTREGUE
  }

  return WORKFLOW_STATUS.OBRA
}

export const buildDashboard = (rows: Obra[]) => {
  return {
    total: rows.length,
    criadas: rows.filter((item) => item.status === 'OBRA_CRIADA').length,
    planejamento: rows.filter((item) => item.status === 'PLANEJAMENTO').length,
    execucao: rows.filter((item) => item.status === 'EXECUCAO').length,
    acompanhamento: rows.filter((item) => item.status === 'ACOMPANHAMENTO').length,
    entrega: rows.filter((item) => item.status === 'ENTREGA').length,
    encerramento: rows.filter((item) => item.status === 'ENCERRAMENTO').length,
  }
}
