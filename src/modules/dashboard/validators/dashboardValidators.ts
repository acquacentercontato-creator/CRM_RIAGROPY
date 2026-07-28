import { z } from 'zod'

export const dashboardFilterSchema = z.object({
  period: z.enum(['HOJE', '7_DIAS', '30_DIAS', '90_DIAS', '12_MESES']),
  responsavel: z.string(),
  departamento: z.string(),
  cliente: z.string(),
})

export type DashboardFilterInput = z.infer<typeof dashboardFilterSchema>
