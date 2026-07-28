import { describe, expect, it } from 'vitest'
import {
  idSchema,
  isoDateSchema,
  nonEmptySchema,
  paginationSchema,
} from '@/shared/validators/commonValidators'

describe('commonValidators', () => {
  it('aceita id valido', () => {
    expect(idSchema.safeParse('abc-123').success).toBe(true)
  })

  it('reprova string vazia em nonEmptySchema', () => {
    expect(nonEmptySchema.safeParse('   ').success).toBe(false)
  })

  it('valida formato basico de data iso', () => {
    expect(isoDateSchema.safeParse('2026-07-27T10:00:00Z').success).toBe(true)
  })

  it('valida paginacao minima', () => {
    const result = paginationSchema.safeParse({ page: 0, rowsPerPage: 10 })
    expect(result.success).toBe(true)
  })
})
