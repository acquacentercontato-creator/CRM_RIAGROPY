import type {
  ObraFiles,
  ObraStatus,
  ObrasUploadCategory,
} from '@/modules/obras/types/obrasTypes'
import type { WorkflowTypeCode } from '@/shared/workflow/WorkflowTypes'

export const OBRAS_COLLECTIONS = {
  obras: 'obras_gestao',
} as const

export const OBRAS_STORAGE = {
  cacheObras: 'riagro.obras.cache.v3',
  draftObra: 'riagro.obras.draft.v3',
} as const

export const OBRAS_STATUS_LABELS: Record<ObraStatus, string> = {
  OBRA_CRIADA: 'Obra Criada',
  PLANEJAMENTO: 'Planejamento',
  EXECUCAO: 'Execucao',
  ACOMPANHAMENTO: 'Acompanhamento',
  ENTREGA: 'Entrega',
  ENCERRAMENTO: 'Encerramento',
}

export const OBRAS_MEDIA_BUCKET: Record<ObrasUploadCategory, keyof ObraFiles> = {
  FOTO: 'fotos',
  VIDEO: 'videos',
  PDF: 'pdfs',
  OUTRO: 'documentos',
}

export const OBRAS_MEDIA_FOLDER: Record<ObrasUploadCategory, string> = {
  FOTO: 'fotos',
  VIDEO: 'videos',
  PDF: 'pdfs',
  OUTRO: 'documentos',
}

export const OBRAS_FLOW = [
  'PROJETO_APROVADO',
  'OBRA_CRIADA',
  'PLANEJAMENTO',
  'EXECUCAO',
  'ACOMPANHAMENTO',
  'ENTREGA',
  'ENCERRAMENTO',
] as const

export const OBRAS_TIPO_OPTIONS: WorkflowTypeCode[] = ['A', 'C', 'P', 'G', 'M', 'R', 'I', 'T']
