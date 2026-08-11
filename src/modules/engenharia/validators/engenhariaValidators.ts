import { z } from 'zod'
import { ENGENHARIA_STATUS } from '@/modules/engenharia/types/engenhariaTypes'

const uploadedFileSchema = z.object({
  id: z.string().min(1),
  category: z.enum(['PDF', 'DWG', 'DXF', 'KMZ', 'FOTO', 'VIDEO', 'OUTRO']),
  name: z.string().min(1),
  mimeType: z.string(),
  size: z.number().nonnegative(),
  url: z.string().min(1),
  createdAt: z.string().min(1),
})

export const engenhariaProjectSchema = z.object({
  clienteNome: z.string().min(2, 'engenharia.validation.clientMin'),
  titulo: z.string().min(3, 'engenharia.validation.titleMin'),
  tipoProjeto: z.enum(['A', 'C', 'P', 'G', 'M', 'R', 'I', 'T']),
  origem: z.enum(['RIEGO', 'IMOTO', 'OUTRO']),
  status: z.enum(ENGENHARIA_STATUS),
  memorialDescritivo: z.string(),
  observacoes: z.string(),
  plantaPdf: z.array(uploadedFileSchema),
  dwg: z.array(uploadedFileSchema),
  dxf: z.array(uploadedFileSchema),
  kmz: z.array(uploadedFileSchema),
  fotos: z.array(uploadedFileSchema),
  videos: z.array(uploadedFileSchema),
  materiais: z.array(uploadedFileSchema),
})
