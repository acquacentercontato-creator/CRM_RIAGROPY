import { z } from 'zod'

export const clienteSchema = z.object({
  razaoSocial: z.string().min(2),
  nomeFantasia: z.string().min(2),
  rucCnpj: z.string().min(5),
  contatoPrincipal: z.string().min(2),
  telefone: z.string().min(6),
  whatsapp: z.string().min(6),
  email: z.string().email(),
  pais: z.string().min(2),
  departamento: z.string().min(2),
  cidade: z.string().min(2),
  endereco: z.string().min(2),
  latitude: z.string(),
  longitude: z.string(),
  observacoes: z.string(),
  status: z.enum(['ATIVO', 'INATIVO', 'PROSPECT']),
  responsavelComercial: z.string().min(2),
})

export const agendaSchema = z.object({
  titulo: z.string().min(2),
  clienteId: z.string().min(1),
  clienteNome: z.string().min(2),
  data: z.string().min(1),
  hora: z.string().min(1),
  tipo: z.enum(['LIGACAO', 'REUNIAO', 'VISITA', 'FOLLOW_UP']),
  status: z.enum(['PENDENTE', 'CONCLUIDO', 'CANCELADO']),
  descricao: z.string(),
})

export const visitaSchema = z.object({
  data: z.string().min(1),
  hora: z.string().min(1),
  clienteId: z.string().min(1),
  clienteNome: z.string().min(2),
  responsavel: z.string().min(2),
  objetivo: z.string().min(2),
  resultado: z.string().min(2),
  fotos: z.array(z.string()),
  videos: z.array(z.string()),
  audios: z.array(z.string()),
  gpsLat: z.string(),
  gpsLng: z.string(),
  observacoes: z.string(),
})

export type ClienteFormInput = z.infer<typeof clienteSchema>
export type AgendaFormInput = z.infer<typeof agendaSchema>
export type VisitaFormInput = z.infer<typeof visitaSchema>
