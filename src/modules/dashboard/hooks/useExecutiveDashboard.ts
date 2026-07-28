import { useMemo, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useAuth } from '@/auth/AuthContext'
import { DashboardService } from '@/modules/dashboard/services/DashboardService'
import type { DashboardFilterState } from '@/modules/dashboard/types/dashboardTypes'
import { defaultDashboardFilters } from '@/modules/dashboard/utils/dashboardUtils'

const queryKey = (filters: DashboardFilterState, role: string) => ['dashboard', 'executivo', role, filters] as const

export const useExecutiveDashboard = () => {
  const { user } = useAuth()
  const [filters, setFilters] = useState<DashboardFilterState>(defaultDashboardFilters)

  const role = user?.role ?? 'ADMINISTRADOR'

  const query = useQuery({
    queryKey: queryKey(filters, role),
    queryFn: () => DashboardService.loadExecutiveDashboard(role, filters),
    staleTime: 45_000,
    gcTime: 10 * 60_000,
    placeholderData: keepPreviousData,
  })

  const widgets = useMemo(() => {
    const source = query.data?.widgetsByRole?.[role]
    return source ?? []
  }, [query.data, role])

  return {
    ...query,
    role,
    filters,
    setFilters,
    widgets,
  }
}
