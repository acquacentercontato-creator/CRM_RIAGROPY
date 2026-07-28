export type ClienteStatus = 'ATIVO' | 'INATIVO' | 'PROSPECT'

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
  createdAt: string
  updatedAt: string
}

export type Oportunidade = {
  id: string
  clienteNome: string
  statusCliente: ClienteStatus
  ultimaVisita: string
  resultadoUltimaVisita: string
  nivel: 'ALTA' | 'MEDIA' | 'BAIXA'
}
