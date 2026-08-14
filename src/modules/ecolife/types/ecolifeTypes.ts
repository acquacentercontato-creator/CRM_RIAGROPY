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
  propertyName: string
  municipality: string
  department: string
  consultantName: string
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
  | 'propertyName'
  | 'municipality'
  | 'department'
  | 'consultantName'
  | 'status'
  | 'expectedRevenue'
  | 'answers'
  | 'observations'
>

export type EcolifeActor = { id: string; name: string }
