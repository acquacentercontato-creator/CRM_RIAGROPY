import type { BaseEntity } from '@/shared/models/base'
import type { WorkflowTypeCode } from '@/shared/workflow/WorkflowTypes'
import type { UploadFileCategory, UploadedFile } from '@/shared/types/core'

export const ENGENHARIA_STATUS = [
  'AGUARDANDO ENGENHARIA',
  'EM PROJETO',
  'AGUARDANDO MEMORIAL',
  'REVISAO',
  'PROJETO COMPLETO',
] as const

export type EngenhariaStatus = (typeof ENGENHARIA_STATUS)[number]

export type EngenhariaApprovalStatus = 'PENDENTE' | 'APROVADO' | 'REVISAO_SOLICITADA'

export type EngenhariaUploadCategory = Extract<
  UploadFileCategory,
  'PDF' | 'DWG' | 'DXF' | 'KMZ' | 'FOTO' | 'VIDEO' | 'OUTRO'
>

export type EngenhariaUploadedFile = Omit<UploadedFile, 'category'> & {
  category: EngenhariaUploadCategory
}

export type EngenhariaProjectFiles = {
  plantaPdf: EngenhariaUploadedFile[]
  dwg: EngenhariaUploadedFile[]
  dxf: EngenhariaUploadedFile[]
  kmz: EngenhariaUploadedFile[]
  fotos: EngenhariaUploadedFile[]
  videos: EngenhariaUploadedFile[]
  materiais: EngenhariaUploadedFile[]
}

export type EngenhariaProject = Omit<BaseEntity, 'status'> &
  EngenhariaProjectFiles & {
    codigoProjeto: string
    clienteNome: string
    titulo: string
    tipoProjeto: WorkflowTypeCode
    origem: 'RIEGO' | 'IMOTO' | 'OUTRO'
    status: EngenhariaStatus
    memorialDescritivo: string
    revisoes: string[]
    aprovadoGerente: EngenhariaApprovalStatus
    workflowStatus: string
    enviadoOrcamento: boolean
    observacoes: string
  }

export type EngenhariaProjectForm = EngenhariaProjectFiles & {
  clienteNome: string
  titulo: string
  tipoProjeto: WorkflowTypeCode
  origem: 'RIEGO' | 'IMOTO' | 'OUTRO'
  status: EngenhariaStatus
  memorialDescritivo: string
  observacoes: string
}

export type EngenhariaActor = {
  id: string
  name: string
  role: 'ADMINISTRADOR' | 'GERENTE' | 'PROJETISTA' | 'COMERCIAL'
}
