import type { EntityStatus, TimelineEvent } from '@/shared/types/core'

export type BaseEntity = {
  id: string
  status: EntityStatus
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  timeline: TimelineEvent[]
}
