import type { BaseEntity } from '@/shared/models/base'
import type { UploadFileCategory, UploadedFile } from '@/shared/types/core'

export const IMOTO_SEGMENTS = ['FABRICA_RACOES', 'TRANSPORTADORES_RODOVIARIOS'] as const

export type ImotoSegment = (typeof IMOTO_SEGMENTS)[number]

export const IMOTO_STATUS = [
  'RASCUNHO',
  'EM_ANALISE',
  'ENVIADO',
  'APROVADO',
  'REPROVADO',
] as const

export type ImotoStatus = (typeof IMOTO_STATUS)[number]

export type ImotoQuestionAnswers = Record<string, string>

export type ImotoUploadCategory = Extract<
  UploadFileCategory,
  'FOTO' | 'VIDEO' | 'PDF' | 'DWG' | 'DXF' | 'KMZ'
>

export type ImotoUploadedFile = Omit<UploadedFile, 'category'> & {
  category: ImotoUploadCategory
}

export type ImotoMediaBuckets = {
  fotos: ImotoUploadedFile[]
  videos: ImotoUploadedFile[]
  pdfs: ImotoUploadedFile[]
  dwgs: ImotoUploadedFile[]
  dxfs: ImotoUploadedFile[]
  kmzs: ImotoUploadedFile[]
}

export type ImotoLevantamento = Omit<BaseEntity, 'status'> &
  ImotoMediaBuckets & {
    codigo: string
    clienteNome: string
    unidadeIndustrial: string
    responsavelTecnico: string
    segmento: ImotoSegment
    observacoes: string
    gpsLat: string
    gpsLng: string
    questionnaire: ImotoQuestionAnswers
    workflowTipo: 'I' | 'T'
    status: ImotoStatus
  }

export type ImotoLevantamentoForm = ImotoMediaBuckets & {
  clienteNome: string
  unidadeIndustrial: string
  responsavelTecnico: string
  segmento: ImotoSegment
  status: ImotoStatus
  observacoes: string
  gpsLat: string
  gpsLng: string
  questionnaire: ImotoQuestionAnswers
}

export type ImotoActor = {
  id: string
  name: string
  role: 'ADMINISTRADOR' | 'GERENTE' | 'PROJETISTA' | 'COMERCIAL'
}
