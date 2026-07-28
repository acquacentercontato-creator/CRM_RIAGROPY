import type { AppRole } from '@/shared/types/auth'
import type { WorkflowStatus } from '@/shared/workflow/WorkflowTypes'

type BaseEntityStatus =
  | 'RASCUNHO'
  | 'ATIVO'
  | 'INATIVO'
  | 'EM_ANALISE'
  | 'ENVIADO'
  | 'APROVADO'
  | 'REPROVADO'
  | 'REVISAO'
  | 'OBRA_CRIADA'
  | 'PLANEJAMENTO'
  | 'EXECUCAO'
  | 'ACOMPANHAMENTO'
  | 'ENTREGA'
  | 'ENCERRAMENTO'

export type EntityStatus = BaseEntityStatus | WorkflowStatus

export type TimelineEvent = {
  id: string
  type: string
  message: string
  actorId: string
  actorName: string
  createdAt: string
  date?: string
  time?: string
  action?: string
  previousStatus?: string | null
  nextStatus?: string
  observation?: string
}

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'SEND' | 'LOGIN' | 'LOGOUT' | 'UPLOAD'

export type AuditLog = {
  id: string
  userId: string
  userName: string
  role: AppRole
  action: AuditAction
  entity: string
  entityId: string
  timestamp: string
  details?: Record<string, unknown>
}

export type PaginationState = {
  page: number
  rowsPerPage: number
}

export type SearchState = {
  term: string
}

export type FilterOperator = 'eq' | 'contains' | 'in'

export type FilterRule<T> = {
  key: keyof T
  op: FilterOperator
  value: string | string[]
}

export type UploadFileCategory =
  | 'FOTO'
  | 'VIDEO'
  | 'PDF'
  | 'DWG'
  | 'DXF'
  | 'KMZ'
  | 'OUTRO'

export type UploadedFile = {
  id: string
  category: UploadFileCategory
  name: string
  mimeType: string
  size: number
  url: string
  createdAt: string
}
