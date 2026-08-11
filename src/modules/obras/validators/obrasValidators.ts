import { z } from 'zod'
import { OBRAS_STATUS } from '@/modules/obras/types/obrasTypes'

const uploadSchema = z.object({
  id: z.string().min(1, 'obras.validation.required'),
  category: z.enum(['FOTO', 'VIDEO', 'PDF', 'OUTRO']),
  name: z.string().min(1, 'obras.validation.required'),
  mimeType: z.string(),
  size: z.number().nonnegative('obras.validation.nonnegative'),
  url: z.string().min(1, 'obras.validation.required'),
  createdAt: z.string().min(1, 'obras.validation.required'),
})

const teamMemberSchema = z.object({
  id: z.string().min(1, 'obras.validation.required'),
  nome: z.string().min(2, 'obras.validation.minTwo'),
  funcao: z.string().min(2, 'obras.validation.minTwo'),
})

const teamSchema = z.object({
  id: z.string().min(1, 'obras.validation.required'),
  nome: z.string().min(2, 'obras.validation.minTwo'),
  responsavel: z.string().min(2, 'obras.validation.minTwo'),
  integrantes: z.array(teamMemberSchema),
})

const scheduleSchema = z.object({
  id: z.string().min(1, 'obras.validation.required'),
  etapa: z.string().min(2, 'obras.validation.minTwo'),
  dataInicio: z.string().min(1, 'obras.validation.required'),
  dataFim: z.string().min(1, 'obras.validation.required'),
  percentualConcluido: z
    .number()
    .min(0, 'obras.validation.percentage')
    .max(100, 'obras.validation.percentage'),
  dependencias: z.array(z.string()),
})

const diarySchema = z.object({
  id: z.string().min(1, 'obras.validation.required'),
  data: z.string().min(1, 'obras.validation.required'),
  responsavel: z.string().min(2, 'obras.validation.minTwo'),
  atividades: z.string().min(2, 'obras.validation.minTwo'),
  ocorrencias: z.string(),
  observacoes: z.string(),
})

export const obraSchema = z.object({
  clienteNome: z.string().min(2, 'obras.validation.clientMin'),
  projetoId: z.string().min(1, 'obras.validation.projectRequired'),
  projetoNome: z.string().min(2, 'obras.validation.projectNameMin'),
  projetoTipo: z.enum(['A', 'C', 'P', 'G', 'M', 'R', 'I', 'T']),
  responsavelObra: z.string().min(2, 'obras.validation.responsibleMin'),
  status: z.enum(OBRAS_STATUS),
  dataCriacaoObra: z.string().min(1, 'obras.validation.required'),
  dataInicio: z.string(),
  dataPrevista: z.string(),
  dataEntrega: z.string(),
  prioridade: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'CRITICA']),
  observacoesPlanejamento: z.string(),
  equipes: z.array(teamSchema),
  cronograma: z.array(scheduleSchema),
  diarioObra: z.array(diarySchema),
  checklist: z.object({
    materiais: z.boolean(),
    equipamentos: z.boolean(),
    seguranca: z.boolean(),
    testes: z.boolean(),
    entrega: z.boolean(),
  }),
  entregaTecnica: z.object({
    data: z.string(),
    responsavel: z.string(),
    assinatura: z.string(),
    observacoes: z.string(),
  }),
  fotos: z.array(uploadSchema),
  videos: z.array(uploadSchema),
  documentos: z.array(uploadSchema),
  pdfs: z.array(uploadSchema),
})
