import { z } from 'zod'
import { RIEGO_SEGMENTS, RIEGO_STATUS } from '@/modules/riego/types/riegoTypes'
import { RIEGO_SEGMENT_QUESTIONS } from '@/modules/riego/models/riegoModels'

const mediaItemSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['FOTO', 'VIDEO', 'DOCUMENTO']),
  name: z.string().min(1),
  url: z.string().min(1),
  createdAt: z.string().min(1),
})

export const riegoLevantamentoSchema = z
  .object({
    clienteNome: z.string().min(2),
    propriedade: z.string().min(2),
    responsavel: z.string().min(2),
    segmento: z.enum(RIEGO_SEGMENTS),
    status: z.enum(RIEGO_STATUS),
    observacoes: z.string(),
    gpsLat: z.string(),
    gpsLng: z.string(),
    questionnaire: z.record(z.string(), z.string()),
    fotos: z.array(mediaItemSchema),
    videos: z.array(mediaItemSchema),
    documentos: z.array(mediaItemSchema),
  })
  .superRefine((value, ctx) => {
    const questions = RIEGO_SEGMENT_QUESTIONS[value.segmento]

    questions.forEach((question) => {
      const answer = value.questionnaire[question.key]
      if (!answer || !answer.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Preencha: ${question.label}`,
          path: ['questionnaire', question.key],
        })
      }
    })
  })
