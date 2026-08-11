export type ClienteStatus = 'ATIVO' | 'INATIVO' | 'PROSPECT'

export type ClienteClassificacao = 'LEAD' | 'PROSPECT' | 'CLIENTE' | 'VIP'

export type ClienteOrigem =
  | 'INSTAGRAM'
  | 'FACEBOOK'
  | 'YOUTUBE'
  | 'INDICACAO'
  | 'SITE'
  | 'FEIRA'
  | 'WHATSAPP'
  | 'LIGACAO'
  | 'OUTRO'

export type ClienteTemperatura = 'FRIO' | 'MORNO' | 'QUENTE' | 'URGENTE'

export type Cliente = {
  id: string
  codigoInterno: string
  razaoSocial: string
  nomeFantasia: string
  rucCnpj: string
  contatoPrincipal: string
  telefone: string
  whatsapp: string
  email: string
  pais: string
  departamento: string
  cidade: string
  endereco: string
  latitude: string
  longitude: string
  observacoes: string
  status: ClienteStatus
  responsavelComercial: string
  // CRM fields
  classificacao?: ClienteClassificacao
  origem?: ClienteOrigem
  temperatura?: ClienteTemperatura
  createdAt: string
  updatedAt: string
}

export type AgendaCompromisso = {
  id: string
  titulo: string
  clienteId: string
  clienteNome: string
  data: string
  hora: string
  tipo: 'LIGACAO' | 'REUNIAO' | 'VISITA' | 'FOLLOW_UP'
  status: 'PENDENTE' | 'CONCLUIDO' | 'CANCELADO'
  descricao: string
  createdAt: string
  updatedAt: string
}

export type VisitaChecklistItem = {
  id: string
  label: string
  done: boolean
}

export type Visita = {
  id: string
  data: string
  hora: string
  clienteId: string
  clienteNome: string
  responsavel: string
  objetivo: string
  resultado: string
  fotos: string[]
  videos: string[]
  audios: string[]
  gpsLat: string
  gpsLng: string
  observacoes: string
  // CRM fields
  checkin?: string    // ISO timestamp
  checkout?: string   // ISO timestamp
  checklist?: VisitaChecklistItem[]
  createdAt: string
  updatedAt: string
}

export type FunilEtapa =
  | 'LEAD'
  | 'CONTATO'
  | 'VISITA'
  | 'LEVANTAMENTO'
  | 'PROJETO'
  | 'APRESENTACAO'
  | 'NEGOCIACAO'
  | 'FECHAMENTO'
  | 'EXECUCAO'
  | 'POS_VENDA'

export const FUNIL_ETAPAS: FunilEtapa[] = [
  'LEAD', 'CONTATO', 'VISITA', 'LEVANTAMENTO', 'PROJETO',
  'APRESENTACAO', 'NEGOCIACAO', 'FECHAMENTO', 'EXECUCAO', 'POS_VENDA',
]

export type Oportunidade = {
  id: string
  clienteId: string
  clienteNome: string
  statusCliente: ClienteStatus
  ultimaVisita: string
  resultadoUltimaVisita: string
  nivel: 'ALTA' | 'MEDIA' | 'BAIXA'
  // CRM fields
  etapaFunil?: FunilEtapa
  valorEstimado?: number
  probabilidade?: number    // 0-100 %
  concorrente?: string
  dataFechamento?: string   // ISO date
  produto?: string
  tipoProduto?: string
  observacoes?: string
  responsavel?: string
  createdAt?: string
  updatedAt?: string
}

export type FollowUpTipo = 'LIGACAO' | 'VISITA' | 'WHATSAPP' | 'EMAIL'

export type FollowUp = {
  id: string
  clienteId: string
  clienteNome: string
  oportunidadeId?: string
  tipo: FollowUpTipo
  dataHora: string       // ISO datetime
  descricao: string
  status: 'PENDENTE' | 'REALIZADO' | 'CANCELADO'
  resultado?: string
  criadoEm: string
  criadoPor: string
}
