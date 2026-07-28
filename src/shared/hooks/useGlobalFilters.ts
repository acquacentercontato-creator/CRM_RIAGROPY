import { useMemo, useState } from 'react'
import { applyFilters } from '@/shared/helpers/dataStateHelpers'
import type { FilterRule } from '@/shared/types/core'

export const useGlobalFilters = <T extends Record<string, unknown>>(items: T[]) => {
  const [filters, setFilters] = useState<FilterRule<T>[]>([])

  const filtered = useMemo(() => applyFilters(items, filters), [items, filters])

  return {
    filters,
    setFilters,
    filtered,
  }
}
