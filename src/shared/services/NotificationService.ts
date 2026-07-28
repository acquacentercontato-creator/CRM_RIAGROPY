import { CORE_EVENTS, EventBus } from '@/shared/services/EventBus'

export type NotificationLevel = 'success' | 'info' | 'warning' | 'error'

export type NotificationRecord = {
  id: string
  level: NotificationLevel
  title: string
  message: string
  createdAt: string
  metadata?: Record<string, unknown>
}

const STORAGE_KEY = 'riagro.notifications'

const readQueue = (): NotificationRecord[] => {
  const raw = globalThis.localStorage?.getItem(STORAGE_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as NotificationRecord[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const persistQueue = (queue: NotificationRecord[]) => {
  globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(queue.slice(0, 200)))
}

export const NotificationService = {
  create(level: NotificationLevel, title: string, message: string, metadata?: Record<string, unknown>) {
    const record: NotificationRecord = {
      id: crypto.randomUUID(),
      level,
      title,
      message,
      createdAt: new Date().toISOString(),
      metadata,
    }

    const queue = [record, ...readQueue()]
    persistQueue(queue)
    EventBus.emit(CORE_EVENTS.NOTIFICATION_CREATED, record)
    return record
  },

  notifyWorkflowChange(payload: {
    projetoId: string
    codigoOficial: string
    statusAnterior: string | null
    statusNovo: string
    usuarioNome: string
  }) {
    const originStatus = payload.statusAnterior ?? 'SEM STATUS'
    return this.create(
      'info',
      'Workflow atualizado',
      `${payload.codigoOficial}: ${originStatus} -> ${payload.statusNovo} por ${payload.usuarioNome}`,
      payload
    )
  },

  list() {
    return readQueue()
  },

  clear() {
    persistQueue([])
  },
}
