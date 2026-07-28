import type { FilterRule, PaginationState } from '@/shared/types/core'

export const textMatch = (value: string, term: string) =>
  value.toLowerCase().includes(term.trim().toLowerCase())

export const applySearch = <T>(items: T[], term: string, project: (item: T) => string) => {
  if (!term.trim()) return items
  return items.filter((item) => textMatch(project(item), term))
}

export const applyFilters = <T extends Record<string, unknown>>(items: T[], filters: FilterRule<T>[]) => {
  if (filters.length === 0) return items

  return items.filter((item) => {
    return filters.every((filter) => {
      const target = String(item[filter.key] ?? '')

      if (filter.op === 'eq') {
        return target === String(filter.value)
      }

      if (filter.op === 'contains') {
        return target.toLowerCase().includes(String(filter.value).toLowerCase())
      }

      const list = Array.isArray(filter.value) ? filter.value : [String(filter.value)]
      return list.includes(target)
    })
  })
}

export const applyPagination = <T>(items: T[], pagination: PaginationState) => {
  const start = pagination.page * pagination.rowsPerPage
  return items.slice(start, start + pagination.rowsPerPage)
}
