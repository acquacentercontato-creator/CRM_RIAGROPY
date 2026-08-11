import { z } from 'zod'
import { IMOTO_SEGMENT_QUESTIONS } from '@/modules/imoto/models/imotoModels'
import { IMOTO_SEGMENTS, IMOTO_STATUS } from '@/modules/imoto/types/imotoTypes'

const uploadedFileSchema = z.object({
  id: z.string().min(1),
  category: z.enum(['FOTO', 'VIDEO', 'PDF', 'DWG', 'DXF', 'KMZ']),
  name: z.string().min(1),
  mimeType: z.string(),
  size: z.number().nonnegative(),
  url: z.string().min(1),
  createdAt: z.string().min(1),
})

export const imotoLevantamentoSchema = z
  .object({
    clienteNome: z.string().min(2, 'imoto.validation.clientMin'),
    unidadeIndustrial: z.string().min(2, 'imoto.validation.unitMin'),
    responsavelTecnico: z.string().min(2, 'imoto.validation.responsibleMin'),
    segmento: z.enum(IMOTO_SEGMENTS),
    status: z.enum(IMOTO_STATUS),
    observacoes: z.string(),
    gpsLat: z.string(),
    gpsLng: z.string(),
    questionnaire: z.record(z.string(), z.string()),
    fotos: z.array(uploadedFileSchema),
    videos: z.array(uploadedFileSchema),
    pdfs: z.array(uploadedFileSchema),
    dwgs: z.array(uploadedFileSchema),
    dxfs: z.array(uploadedFileSchema),
    kmzs: z.array(uploadedFileSchema),
  })
  .superRefine((value, ctx) => {
    const questions = IMOTO_SEGMENT_QUESTIONS[value.segmento]

    questions.forEach((question) => {
      const answer = value.questionnaire[question.key]
      if (!answer || !answer.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'imoto.validation.required',
          path: ['questionnaire', question.key],
        })
      }
    })
  })
