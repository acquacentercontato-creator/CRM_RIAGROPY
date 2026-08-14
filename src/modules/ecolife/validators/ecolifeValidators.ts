import { z } from 'zod'
import { ECOLIFE_PRODUCTS, ECOLIFE_STATUS } from '@/modules/ecolife/types/ecolifeTypes'

export const ecolifeDiagnosticSchema = z.object({
  product: z.enum(ECOLIFE_PRODUCTS),
  propertyName: z.string().min(2, 'ecolife.validation.property'),
  municipality: z.string().min(2, 'ecolife.validation.municipality'),
  department: z.string().min(2, 'ecolife.validation.department'),
  status: z.enum(ECOLIFE_STATUS),
  expectedRevenue: z.number().min(0, 'ecolife.validation.revenue'),
  answers: z.record(z.string(), z.string()),
  observations: z.string(),
})
