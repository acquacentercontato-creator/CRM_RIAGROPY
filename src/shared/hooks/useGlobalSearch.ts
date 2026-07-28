import { useMemo, useState } from 'react'
import { applySearch } from '@/shared/helpers/dataStateHelpers'

export const useGlobalSearch = <T>(items: T[], projector: (item: T) => string) => {
  const [term, setTerm] = useState('')

  const filtered = useMemo(() => applySearch(items, term, projector), [items, term, projector])

  return {
    term,
    setTerm,
    filtered,
  }
}
