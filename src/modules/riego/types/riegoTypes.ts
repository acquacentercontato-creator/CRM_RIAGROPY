export const RIEGO_SEGMENTS = [
  'ASPERSAO',
  'CARRETEL',
  'PIVO',
  'GOTEJAMENTO',
  'MICROASPERSAO',
  'RECALQUE',
] as const

export type RiegoSegment = (typeof RIEGO_SEGMENTS)[number]

export const RIEGO_STATUS = [
  'RASCUNHO',
  'EM_ANALISE',
  'ENVIADO_ENGENHARIA',
  'APROVADO_ENGENHARIA',
  'REPROVADO_ENGENHARIA',
] as const

export type RiegoStatus = (typeof RIEGO_STATUS)[number]

export type RiegoMediaType = 'FOTO' | 'VIDEO' | 'DOCUMENTO'

export type RiegoMediaItem = {
  id: string
  type: RiegoMediaType
  name: string
  url: string
  createdAt: string
}

export type RiegoTimelineEvent = {
  id: string
  type: string
  message: string
  createdAt: string
  actor: string
}

export type RiegoQuestionAnswers = Record<string, string>

export type RiegoLevantamento = {
  id: string
  codigo: string
  clienteNome: string
  propriedade: string
  responsavel: string
  segmento: RiegoSegment
  status: RiegoStatus
  observacoes: string
  gpsLat: string
  gpsLng: string
  questionnaire: RiegoQuestionAnswers
  fotos: RiegoMediaItem[]
  videos: RiegoMediaItem[]
  documentos: RiegoMediaItem[]
  timeline: RiegoTimelineEvent[]
  createdAt: string
  updatedAt: string
}

export type RiegoLevantamentoForm = {
  clienteNome: string
  propriedade: string
  responsavel: string
  segmento: RiegoSegment
  status: RiegoStatus
  observacoes: string
  gpsLat: string
  gpsLng: string
  questionnaire: RiegoQuestionAnswers
  fotos: RiegoMediaItem[]
  videos: RiegoMediaItem[]
  documentos: RiegoMediaItem[]
}
