import { z } from 'zod'
import {
  ECOLIFE_PRIORITIES,
  ECOLIFE_PRODUCTS,
  ECOLIFE_STATUS,
} from '@/modules/ecolife/types/ecolifeTypes'

export const ecolifeDiagnosticSchema = z.object({
  product: z.enum(ECOLIFE_PRODUCTS),
  clientId: z.string().min(1, 'ecolife.validation.client'),
  clientName: z.string().min(1, 'ecolife.validation.client'),
  propertyName: z.string().min(2, 'ecolife.validation.property'),
  municipality: z.string().min(2, 'ecolife.validation.municipality'),
  department: z.string().min(2, 'ecolife.validation.department'),
  consultantName: z.string().min(2, 'ecolife.validation.consultant'),
  priority: z.enum(ECOLIFE_PRIORITIES),
  status: z.enum(ECOLIFE_STATUS),
  expectedRevenue: z.number().min(0, 'ecolife.validation.revenue'),
  saleValue: z.number().min(0, 'ecolife.validation.revenue'),
  riagroCommission: z.number().min(0, 'ecolife.validation.revenue'),
  answers: z.record(z.string(), z.string()),
  observations: z.string(),
})
