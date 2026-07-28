import type {
  EngenhariaProjectFiles,
  EngenhariaStatus,
  EngenhariaUploadCategory,
} from '@/modules/engenharia/types/engenhariaTypes'
import type { WorkflowTypeCode } from '@/shared/workflow/WorkflowTypes'

export const ENGENHARIA_COLLECTIONS = {
  projetos: 'engenharia_projetos',
} as const

export const ENGENHARIA_STORAGE = {
  cacheProjetos: 'riagro.engenharia.projetos.v3',
  draftProjeto: 'riagro.engenharia.draft.v3',
} as const

export const ENGENHARIA_STATUS_LABELS: Record<EngenhariaStatus, string> = {
  'AGUARDANDO ENGENHARIA': 'Aguardando Engenharia',
  'EM PROJETO': 'Em Projeto',
  'AGUARDANDO MEMORIAL': 'Aguardando Memorial',
  REVISAO: 'Revisao',
  'PROJETO COMPLETO': 'Projeto Completo',
}

export const ENGENHARIA_STATUS_OPTIONS = Object.keys(
  ENGENHARIA_STATUS_LABELS
) as EngenhariaStatus[]

export const ENGENHARIA_MEDIA_BUCKET: Record<EngenhariaUploadCategory, keyof EngenhariaProjectFiles> = {
  PDF: 'plantaPdf',
  DWG: 'dwg',
  DXF: 'dxf',
  KMZ: 'kmz',
  FOTO: 'fotos',
  VIDEO: 'videos',
  OUTRO: 'materiais',
}

export const ENGENHARIA_MEDIA_FOLDER: Record<EngenhariaUploadCategory, string> = {
  PDF: 'planta-pdf',
  DWG: 'dwg',
  DXF: 'dxf',
  KMZ: 'kmz',
  FOTO: 'fotos',
  VIDEO: 'videos',
  OUTRO: 'materiais',
}

export const ENGENHARIA_TYPE_OPTIONS: WorkflowTypeCode[] = [
  'A',
  'C',
  'P',
  'G',
  'M',
  'R',
  'I',
  'T',
]

export const ENGENHARIA_FLOW = [
  'CLIENTE',
  'VISITA',
  'LEVANTAMENTO',
  'AGUARDANDO ENGENHARIA',
  'EM PROJETO',
  'AGUARDANDO MEMORIAL',
  'PROJETO COMPLETO',
  'ORÇAMENTO',
] as const
