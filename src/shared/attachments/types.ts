/**
 * Tipos e interfaces para o módulo central de anexos
 */

export type AttachmentType = 
  | 'PDF'
  | 'JPG'
  | 'PNG'
  | 'HEIC'
  | 'DOCX'
  | 'XLSX'
  | 'DWG'
  | 'DXF'
  | 'KMZ'
  | 'KML'
  | 'ZIP'
  | 'MP4'

export type AttachmentCategory = 
  | 'DOCUMENTACAO'
  | 'MIDIA'
  | 'TECNICO'
  | 'FINANCEIRO'
  | 'ADMINISTRATIVO'
  | 'OUTRO'

export type AttachmentStatus = 
  | 'ATIVO'
  | 'ARQUIVADO'
  | 'DELETADO'

export type ModuleContext = 
  | 'CLIENTES'
  | 'VISITAS'
  | 'ENGENHARIA'
  | 'OBRAS'
  | 'ASSISTENCIA'
  | 'COMERCIAL'
  | 'ECOLIFE'

export interface AttachmentMetadata {
  id: string
  nome: string
  tipo: AttachmentType
  categoria: AttachmentCategory
  tamanho: number // bytes
  mimeType: string
  url: string
  firebaseStoragePath: string
  versao: number
  status: AttachmentStatus
  isFavorite: boolean
  
  // Localização
  clienteId: string
  clienteNome: string
  projetoId?: string // Opcional
  moduloContext: ModuleContext
  
  // Temporal
  criadoEm: string // ISO date
  criadoPor: string // userId
  atualizadoEm: string
  atualizadoPor: string
  
  // Observações e tracking
  observacoes?: string
  tags?: string[]
  downloadCount: number
}

export interface AttachmentVersion {
  id: string
  attachmentId: string
  versao: number
  url: string
  firebaseStoragePath: string
  tamanho: number
  criadoEm: string
  criadoPor: string
  mudancas?: string // Descrição de mudanças
}

export interface AttachmentHistory {
  id: string
  attachmentId: string
  acao: 'UPLOAD' | 'DOWNLOAD' | 'VISUALIZACAO' | 'EXCLUSAO' | 'RESTAURACAO' | 'RENOMEACAO' | 'ALTERACAO_CATEGORIA'
  usuario: string
  data: string // ISO date
  hora: string
  observacao?: string
  versao?: number
  detalhes?: Record<string, unknown>
}

export interface AttachmentSearchFilter {
  query?: string
  tipo?: AttachmentType[]
  categoria?: AttachmentCategory[]
  clienteId?: string
  moduloContext?: ModuleContext[]
  status?: AttachmentStatus
  dataInicio?: string // ISO date
  dataFim?: string // ISO date
  isFavorite?: boolean
  criadoPor?: string
  ordenarPor?: 'nome' | 'data' | 'tamanho' | 'downloads'
  ordem?: 'ASC' | 'DESC'
  pagina?: number
  limite?: number
}

export interface AttachmentUploadRequest {
  arquivo: File
  nome: string
  tipo: AttachmentType
  categoria: AttachmentCategory
  clienteId: string
  clienteNome: string
  projetoId?: string
  moduloContext: ModuleContext
  observacoes?: string
  tags?: string[]
}

export interface AttachmentPreviewConfig {
  tipo: AttachmentType
  url: string
  altura?: number
  largura?: number
}

export interface AttachmentFavorito {
  id: string
  attachmentId: string
  usuarioId: string
  criadoEm: string
}

export interface AttachmentRecente {
  id: string
  attachmentId: string
  usuarioId: string
  dataAcesso: string
  tipoAcesso: 'DOWNLOAD' | 'VISUALIZACAO'
}
