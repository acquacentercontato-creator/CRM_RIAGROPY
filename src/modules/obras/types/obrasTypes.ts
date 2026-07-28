import type { BaseEntity } from '@/shared/models/base'
import type { UploadFileCategory, UploadedFile } from '@/shared/types/core'
import type { WorkflowTypeCode } from '@/shared/workflow/WorkflowTypes'

export const OBRAS_STATUS = [
  'OBRA_CRIADA',
  'PLANEJAMENTO',
  'EXECUCAO',
  'ACOMPANHAMENTO',
  'ENTREGA',
  'ENCERRAMENTO',
] as const

export type ObraStatus = (typeof OBRAS_STATUS)[number]

export type ObraPriority = 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA'

export type ObrasUploadCategory = Extract<UploadFileCategory, 'FOTO' | 'VIDEO' | 'PDF' | 'OUTRO'>

export type ObrasUploadedFile = Omit<UploadedFile, 'category'> & {
  category: ObrasUploadCategory
}

export type ObraTeamMember = {
  id: string
  nome: string
  funcao: string
}

export type ObraTeam = {
  id: string
  nome: string
  responsavel: string
  integrantes: ObraTeamMember[]
}

export type ObraScheduleItem = {
  id: string
  etapa: string
  dataInicio: string
  dataFim: string
  percentualConcluido: number
  dependencias: string[]
}

export type ObraDiaryEntry = {
  id: string
  data: string
  responsavel: string
  atividades: string
  ocorrencias: string
  observacoes: string
}

export type ObraChecklist = {
  materiais: boolean
  equipamentos: boolean
  seguranca: boolean
  testes: boolean
  entrega: boolean
}

export type ObraTechnicalDelivery = {
  data: string
  responsavel: string
  assinatura: string
  observacoes: string
}

export type ObraFiles = {
  fotos: ObrasUploadedFile[]
  videos: ObrasUploadedFile[]
  documentos: ObrasUploadedFile[]
  pdfs: ObrasUploadedFile[]
}

export type Obra = Omit<BaseEntity, 'status'> &
  ObraFiles & {
    codigoObra: string
    clienteNome: string
    projetoId: string
    projetoNome: string
    projetoTipo: WorkflowTypeCode
    responsavelObra: string
    status: ObraStatus
    dataCriacaoObra: string
    dataInicio: string
    dataPrevista: string
    dataEntrega: string
    prioridade: ObraPriority
    observacoesPlanejamento: string
    equipes: ObraTeam[]
    cronograma: ObraScheduleItem[]
    diarioObra: ObraDiaryEntry[]
    checklist: ObraChecklist
    entregaTecnica: ObraTechnicalDelivery
  }

export type ObraForm = ObraFiles & {
  clienteNome: string
  projetoId: string
  projetoNome: string
  projetoTipo: WorkflowTypeCode
  responsavelObra: string
  status: ObraStatus
  dataCriacaoObra: string
  dataInicio: string
  dataPrevista: string
  dataEntrega: string
  prioridade: ObraPriority
  observacoesPlanejamento: string
  equipes: ObraTeam[]
  cronograma: ObraScheduleItem[]
  diarioObra: ObraDiaryEntry[]
  checklist: ObraChecklist
  entregaTecnica: ObraTechnicalDelivery
}

export type ObraActor = {
  id: string
  name: string
  role: 'ADMINISTRADOR' | 'GERENTE' | 'PROJETISTA' | 'COMERCIAL'
}
