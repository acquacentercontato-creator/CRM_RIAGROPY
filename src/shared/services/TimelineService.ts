import { CORE_EVENTS, EventBus } from '@/shared/services/EventBus'
import type { TimelineEvent } from '@/shared/types/core'

type TimelineRecord = {
  entityId: string
  codigo: string
  events: TimelineEvent[]
  updatedAt: string
}

const STORAGE_KEY = 'riagro.timeline.records'

const readLocal = (): TimelineRecord[] => {
  const raw = globalThis.localStorage?.getItem(STORAGE_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as TimelineRecord[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const writeLocal = (records: TimelineRecord[]) => {
  globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(records))
}

const uniqById = (events: TimelineEvent[]) => {
  const map = new Map<string, TimelineEvent>()
  events.forEach((event) => map.set(event.id, event))
  return Array.from(map.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export const TimelineService = {
  list(entityId: string): TimelineEvent[] {
    const records = readLocal()
    return records.find((record) => record.entityId === entityId)?.events ?? []
  },

  listAll(): TimelineEvent[] {
    const records = readLocal()
    return records
      .flatMap((record) => record.events)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },

  append(entityId: string, codigo: string, event: TimelineEvent): TimelineEvent[] {
    const records = readLocal()
    const found = records.find((record) => record.entityId === entityId)

    const nextEvents = uniqById([event, ...(found?.events ?? [])])
    const nextRecord: TimelineRecord = {
      entityId,
      codigo,
      events: nextEvents,
      updatedAt: new Date().toISOString(),
    }

    const next = found
      ? records.map((record) => (record.entityId === entityId ? nextRecord : record))
      : [nextRecord, ...records]

    writeLocal(next)

    EventBus.emit(CORE_EVENTS.TIMELINE_APPENDED, {
      projetoId: entityId,
      codigoOficial: codigo,
      timeline: event,
    })

    return nextEvents
  },

  merge(entityId: string, codigo: string, incoming: TimelineEvent[]): TimelineEvent[] {
    const records = readLocal()
    const found = records.find((record) => record.entityId === entityId)

    const nextEvents = uniqById([...(incoming ?? []), ...(found?.events ?? [])])
    const nextRecord: TimelineRecord = {
      entityId,
      codigo,
      events: nextEvents,
      updatedAt: new Date().toISOString(),
    }

    const next = found
      ? records.map((record) => (record.entityId === entityId ? nextRecord : record))
      : [nextRecord, ...records]

    writeLocal(next)
    return nextEvents
  },
}
