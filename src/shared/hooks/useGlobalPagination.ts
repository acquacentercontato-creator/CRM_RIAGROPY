import { useMemo, useState } from 'react'
import { applyPagination } from '@/shared/helpers/dataStateHelpers'

export const useGlobalPagination = <T>(items: T[], initialRowsPerPage = 10) => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage)

  const paginated = useMemo(() => applyPagination(items, { page, rowsPerPage }), [items, page, rowsPerPage])

  return {
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    paginated,
  }
}
