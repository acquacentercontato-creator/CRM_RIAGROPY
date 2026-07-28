import { CORE_EVENTS, EventBus } from '@/shared/services/EventBus'
import type { TimelineEvent } from '@/shared/types/core'
import {
  IMOTO_SEGMENT_LABELS,
  IMOTO_SEGMENT_QUESTIONS,
} from '@/modules/imoto/models/imotoModels'
import type {
  ImotoActor,
  ImotoLevantamento,
  ImotoLevantamentoForm,
  ImotoSegment,
  ImotoStatus,
} from '@/modules/imoto/types/imotoTypes'

export const nowIso = () => new Date().toISOString()

export const makeId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const buildCodigo = (list: ImotoLevantamento[]) => {
  const max = list.reduce((acc, item) => {
    const parsed = Number(item.codigo.replace('IMO-', ''))
    if (Number.isNaN(parsed)) return acc
    return Math.max(acc, parsed)
  }, 0)

  return `IMO-${String(max + 1).padStart(5, '0')}`
}

export const createTimelineEvent = (
  type: string,
  message: string,
  actor: ImotoActor,
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

export const appendTimeline = (
  levantamentoId: string,
  codigo: string,
  list: TimelineEvent[],
  event: TimelineEvent
): TimelineEvent[] => {
  EventBus.emit(CORE_EVENTS.TIMELINE_APPENDED, {
    projetoId: levantamentoId,
    codigoOficial: codigo,
    timeline: event,
  })
  return [event, ...list]
}

export const createEmptyQuestionnaire = (segmento: ImotoSegment): Record<string, string> => {
  return IMOTO_SEGMENT_QUESTIONS[segmento].reduce<Record<string, string>>((acc, item) => {
    acc[item.key] = ''
    return acc
  }, {})
}

export const createEmptyLevantamentoForm = (): ImotoLevantamentoForm => ({
  clienteNome: '',
  unidadeIndustrial: '',
  responsavelTecnico: '',
  segmento: 'FABRICA_RACOES',
  status: 'RASCUNHO',
  observacoes: '',
  gpsLat: '',
  gpsLng: '',
  questionnaire: createEmptyQuestionnaire('FABRICA_RACOES'),
  fotos: [],
  videos: [],
  pdfs: [],
  dwgs: [],
  dxfs: [],
  kmzs: [],
})

export const statusLabel = (status: ImotoStatus) => status.replaceAll('_', ' ')

export const segmentoLabel = (segmento: ImotoSegment) => IMOTO_SEGMENT_LABELS[segmento]
