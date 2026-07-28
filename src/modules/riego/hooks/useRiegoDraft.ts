import { useEffect } from 'react'
import type { RiegoLevantamentoForm } from '@/modules/riego/types/riegoTypes'
import { RiegoService } from '@/modules/riego/services/RiegoService'

export const useRiegoDraft = (values: RiegoLevantamentoForm, enabled: boolean) => {
  useEffect(() => {
    if (!enabled) return

    const timer = window.setTimeout(() => {
      RiegoService.saveDraft(values)
    }, 700)

    return () => window.clearTimeout(timer)
  }, [values, enabled])
}
