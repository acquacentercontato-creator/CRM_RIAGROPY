import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/auth/AuthContext'
import { EcolifeService } from '@/modules/ecolife/services/EcolifeService'
import type { EcolifeDiagnostic, EcolifeDiagnosticForm } from '@/modules/ecolife/types/ecolifeTypes'

const key = ['ecolife', 'diagnostics'] as const
export const useEcolifeDiagnostics = () =>
  useQuery({ queryKey: key, queryFn: () => EcolifeService.listAll() })
export const useEcolifeMutations = () => {
  const client = useQueryClient()
  const { user } = useAuth()
  const actor = { id: user?.id || 'system', name: user?.name || 'system' }
  const refresh = () => client.invalidateQueries({ queryKey: key })
  return {
    create: useMutation({
      mutationFn: (form: EcolifeDiagnosticForm) => EcolifeService.create(form, actor),
      onSuccess: refresh,
    }),
    update: useMutation({
      mutationFn: ({ id, form }: { id: string; form: EcolifeDiagnosticForm }) =>
        EcolifeService.update(id, form, actor),
      onSuccess: refresh,
    }),
    remove: useMutation({
      mutationFn: (item: EcolifeDiagnostic) => EcolifeService.remove(item),
      onSuccess: refresh,
    }),
  }
}
