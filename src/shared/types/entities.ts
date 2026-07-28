import type { BaseEntity } from '@/shared/models/base'
import type { UploadedFile } from '@/shared/types/core'

export type ClienteEntity = BaseEntity & {
  nome: string
  documento: string
  telefone: string
  email: string
}

export type ProjetoEntity = BaseEntity & {
  nome: string
  clienteId: string
  localidade: string
}

export type LevantamentoEntity = BaseEntity & {
  projetoId: string
  responsavelId: string
  dataLevantamento: string
}

export type ArquivoEntity = BaseEntity & {
  entidade: 'cliente' | 'projeto' | 'levantamento'
  entidadeId: string
  arquivo: UploadedFile
}
