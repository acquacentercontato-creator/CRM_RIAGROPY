import { z } from 'zod'
import { OBRAS_STATUS } from '@/modules/obras/types/obrasTypes'

const uploadSchema = z.object({
  id: z.string().min(1),
  category: z.enum(['FOTO', 'VIDEO', 'PDF', 'OUTRO']),
  name: z.string().min(1),
  mimeType: z.string(),
  size: z.number().nonnegative(),
  url: z.string().min(1),
  createdAt: z.string().min(1),
})

const teamMemberSchema = z.object({
  id: z.string().min(1),
  nome: z.string().min(2),
  funcao: z.string().min(2),
})

const teamSchema = z.object({
  id: z.string().min(1),
  nome: z.string().min(2),
  responsavel: z.string().min(2),
  integrantes: z.array(teamMemberSchema),
})

const scheduleSchema = z.object({
  id: z.string().min(1),
  etapa: z.string().min(2),
  dataInicio: z.string().min(1),
  dataFim: z.string().min(1),
  percentualConcluido: z.number().min(0).max(100),
  dependencias: z.array(z.string()),
})

const diarySchema = z.object({
  id: z.string().min(1),
  data: z.string().min(1),
  responsavel: z.string().min(2),
  atividades: z.string().min(2),
  ocorrencias: z.string(),
  observacoes: z.string(),
})

export const obraSchema = z.object({
  clienteNome: z.string().min(2),
  projetoId: z.string().min(1),
  projetoNome: z.string().min(2),
  projetoTipo: z.enum(['A', 'C', 'P', 'G', 'M', 'R', 'I', 'T']),
  responsavelObra: z.string().min(2),
  status: z.enum(OBRAS_STATUS),
  dataCriacaoObra: z.string().min(1),
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
