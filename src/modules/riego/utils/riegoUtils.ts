import {
  RIEGO_SEGMENT_QUESTIONS,
  RIEGO_SEGMENT_LABELS,
} from '@/modules/riego/models/riegoModels'
import type {
  RiegoLevantamento,
  RiegoLevantamentoForm,
  RiegoSegment,
  RiegoStatus,
  RiegoTimelineEvent,
} from '@/modules/riego/types/riegoTypes'

export const nowIso = () => new Date().toISOString()

export const makeId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const buildCodigo = (list: RiegoLevantamento[]) => {
  const max = list.reduce((acc, item) => {
    const parsed = Number(item.codigo.replace('RGO-', ''))
    if (Number.isNaN(parsed)) return acc
    return Math.max(acc, parsed)
  }, 0)

  return `RGO-${String(max + 1).padStart(5, '0')}`
}

export const createTimelineEvent = (
  type: string,
  message: string,
  actor: string
): RiegoTimelineEvent => ({
  id: makeId(),
  type,
  message,
  actor,
  createdAt: nowIso(),
})

export const appendTimeline = (
  list: RiegoTimelineEvent[],
  event: RiegoTimelineEvent
): RiegoTimelineEvent[] => [event, ...list]

export const createEmptyQuestionnaire = (segmento: RiegoSegment): Record<string, string> => {
  return RIEGO_SEGMENT_QUESTIONS[segmento].reduce<Record<string, string>>((acc, item) => {
    acc[item.key] = ''
    return acc
  }, {})
}

export const createEmptyLevantamentoForm = (): RiegoLevantamentoForm => ({
  clienteNome: '',
  propriedade: '',
  responsavel: '',
  segmento: 'ASPERSAO',
  status: 'RASCUNHO',
  observacoes: '',
  gpsLat: '',
  gpsLng: '',
  questionnaire: createEmptyQuestionnaire('ASPERSAO'),
  fotos: [],
  videos: [],
  documentos: [],
})

export const statusLabel = (status: RiegoStatus) => status.replaceAll('_', ' ')

export const segmentoLabel = (segmento: RiegoSegment) => RIEGO_SEGMENT_LABELS[segmento]
