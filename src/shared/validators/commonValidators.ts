import { z } from 'zod'

export const idSchema = z.string().min(1)
export const isoDateSchema = z.string().min(10)
export const nonEmptySchema = z.string().trim().min(1)

export const paginationSchema = z.object({
  page: z.number().min(0),
  rowsPerPage: z.number().min(1),
})
