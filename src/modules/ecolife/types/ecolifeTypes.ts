export const ECOLIFE_PRODUCTS = ['SWINE', 'POULTRY'] as const
export type EcolifeProduct = (typeof ECOLIFE_PRODUCTS)[number]

export const ECOLIFE_STATUS = [
  'LEVANTAMENTO',
  'EM_ANALISE',
  'DIMENSIONAMENTO',
  'PROPOSTA',
  'APRESENTADO',
  'NEGOCIACAO',
  'VENDIDO',
  'IMPLANTACAO',
] as const
export type EcolifeStatus = (typeof ECOLIFE_STATUS)[number]

export const ECOLIFE_PRIORITIES = ['BAIXA', 'MEDIA', 'ALTA', 'CRITICA'] as const
export type EcolifePriority = (typeof ECOLIFE_PRIORITIES)[number]

export type EcolifeTimelineEvent = {
  id: string
  action: 'CREATED' | 'EDITED' | 'PDF_GENERATED' | 'ATTACHMENT_UPLOADED' | 'STATUS_CHANGED'
  status: EcolifeStatus
  createdAt: string
  actorName: string
}

export type EcolifeDiagnostic = {
  id: string
  code: string
  product: EcolifeProduct
  clientId: string
  clientName: string
  propertyName: string
  municipality: string
  department: string
  consultantName: string
  priority: EcolifePriority
  status: EcolifeStatus
  expectedRevenue: number
  answers: Record<string, string>
  observations: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  timeline: EcolifeTimelineEvent[]
}

export type EcolifeDiagnosticForm = Pick<
  EcolifeDiagnostic,
  | 'product'
  | 'clientId'
  | 'clientName'
  | 'propertyName'
  | 'municipality'
  | 'department'
  | 'consultantName'
  | 'priority'
  | 'status'
  | 'expectedRevenue'
  | 'answers'
  | 'observations'
>

export type EcolifeActor = { id: string; name: string }
