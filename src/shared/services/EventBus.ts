type Handler<T> = (payload: T) => void

class InternalEventBus {
  private listeners: Map<string, Set<Handler<unknown>>> = new Map()

  on<T>(eventName: string, handler: Handler<T>) {
    const set = this.listeners.get(eventName) ?? new Set<Handler<unknown>>()
    set.add(handler as Handler<unknown>)
    this.listeners.set(eventName, set)

    return () => {
      set.delete(handler as Handler<unknown>)
      if (set.size === 0) this.listeners.delete(eventName)
    }
  }

  emit<T>(eventName: string, payload: T) {
    const set = this.listeners.get(eventName)
    if (!set) return
    set.forEach((handler) => handler(payload))
  }
}

export const CORE_EVENTS = {
  WORKFLOW_CHANGED: 'core.workflow.changed',
  WORKFLOW_APPROVED: 'core.workflow.approved',
  WORKFLOW_REVISION_REQUESTED: 'core.workflow.revision.requested',
  TIMELINE_APPENDED: 'core.timeline.appended',
  NOTIFICATION_CREATED: 'core.notification.created',
} as const

export const EventBus = new InternalEventBus()
