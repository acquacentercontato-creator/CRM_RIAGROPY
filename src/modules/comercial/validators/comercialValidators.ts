import { z } from 'zod'

export const clienteSchema = z.object({
  razaoSocial: z.string().min(2, 'comercial.clientes.validation.minTwoCharacters'),
  nomeFantasia: z.string().min(2, 'comercial.clientes.validation.minTwoCharacters'),
  rucCnpj: z.string().min(5, 'comercial.clientes.validation.minFiveCharacters'),
  contatoPrincipal: z.string().min(2, 'comercial.clientes.validation.minTwoCharacters'),
  telefone: z.string().min(6, 'comercial.clientes.validation.minSixCharacters'),
  whatsapp: z.string().min(6, 'comercial.clientes.validation.minSixCharacters'),
  email: z.string().email('comercial.clientes.validation.invalidEmail'),
  pais: z.string().min(2, 'comercial.clientes.validation.minTwoCharacters'),
  departamento: z.string().min(2, 'comercial.clientes.validation.minTwoCharacters'),
  cidade: z.string().min(2, 'comercial.clientes.validation.minTwoCharacters'),
  endereco: z.string().min(2, 'comercial.clientes.validation.minTwoCharacters'),
  latitude: z.string(),
  longitude: z.string(),
  observacoes: z.string(),
  status: z.enum(['ATIVO', 'INATIVO', 'PROSPECT']),
  responsavelComercial: z.string().min(2, 'comercial.clientes.validation.minTwoCharacters'),
  // CRM fields
  classificacao: z.enum(['LEAD', 'PROSPECT', 'CLIENTE', 'VIP']).optional(),
  origem: z.enum(['INSTAGRAM', 'FACEBOOK', 'YOUTUBE', 'INDICACAO', 'SITE', 'FEIRA', 'WHATSAPP', 'LIGACAO', 'OUTRO']).optional(),
  temperatura: z.enum(['FRIO', 'MORNO', 'QUENTE', 'URGENTE']).optional(),
})

export const agendaSchema = z.object({
  titulo: z.string().min(2, 'comercial.validation.minTwoCharacters'),
  clienteId: z.string().min(1, 'comercial.validation.required'),
  clienteNome: z.string().min(2, 'comercial.validation.minTwoCharacters'),
  data: z.string().min(1, 'comercial.validation.required'),
  hora: z.string().min(1, 'comercial.validation.required'),
  tipo: z.enum(['LIGACAO', 'REUNIAO', 'VISITA', 'FOLLOW_UP']),
  status: z.enum(['PENDENTE', 'CONCLUIDO', 'CANCELADO']),
  descricao: z.string(),
})

export const visitaSchema = z.object({
  data: z.string().min(1, 'comercial.validation.required'),
  hora: z.string().min(1, 'comercial.validation.required'),
  clienteId: z.string().min(1, 'comercial.validation.required'),
  clienteNome: z.string().min(2, 'comercial.validation.minTwoCharacters'),
  responsavel: z.string().min(2, 'comercial.validation.minTwoCharacters'),
  objetivo: z.string().min(2, 'comercial.validation.minTwoCharacters'),
  resultado: z.string().min(2, 'comercial.validation.minTwoCharacters'),
  fotos: z.array(z.string()),
  videos: z.array(z.string()),
  audios: z.array(z.string()),
  gpsLat: z.string(),
  gpsLng: z.string(),
  observacoes: z.string(),
  checkin: z.string().optional(),
  checkout: z.string().optional(),
})

export const oportunidadeSchema = z.object({
  clienteId: z.string().min(1, 'comercial.validation.required'),
  clienteNome: z.string().min(2, 'comercial.validation.minTwoCharacters'),
  nivel: z.enum(['ALTA', 'MEDIA', 'BAIXA']),
  etapaFunil: z.enum(['LEAD', 'CONTATO', 'VISITA', 'LEVANTAMENTO', 'PROJETO', 'APRESENTACAO', 'NEGOCIACAO', 'FECHAMENTO', 'EXECUCAO', 'POS_VENDA']).optional(),
  valorEstimado: z.number().min(0, 'crm.oportunidade.validation.nonNegative').optional(),
  probabilidade: z
    .number()
    .min(0, 'crm.oportunidade.validation.probabilityRange')
    .max(100, 'crm.oportunidade.validation.probabilityRange')
    .optional(),
  concorrente: z.string().optional(),
  dataFechamento: z.string().optional(),
  produto: z.string().optional(),
  tipoProduto: z.string().optional(),
  observacoes: z.string().optional(),
  responsavel: z.string().optional(),
})

export const followUpSchema = z.object({
  clienteId: z.string().min(1),
  clienteNome: z.string().min(2),
  oportunidadeId: z.string().optional(),
  tipo: z.enum(['LIGACAO', 'VISITA', 'WHATSAPP', 'EMAIL']),
  dataHora: z.string().min(1),
  descricao: z.string().min(2),
  status: z.enum(['PENDENTE', 'REALIZADO', 'CANCELADO']),
  resultado: z.string().optional(),
})

export type ClienteFormInput = z.infer<typeof clienteSchema>
export type AgendaFormInput = z.infer<typeof agendaSchema>
export type VisitaFormInput = z.infer<typeof visitaSchema>
export type OportunidadeFormInput = z.infer<typeof oportunidadeSchema>
export type FollowUpFormInput = z.infer<typeof followUpSchema>
