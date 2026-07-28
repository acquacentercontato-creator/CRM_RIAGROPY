import { useEffect } from 'react'
import { ObrasService } from '@/modules/obras/services/ObrasService'
import type { ObraForm } from '@/modules/obras/types/obrasTypes'

export const useObrasDraft = (values: ObraForm, enabled: boolean) => {
  useEffect(() => {
    if (!enabled) return

    const timer = window.setTimeout(() => {
      ObrasService.saveDraft(values)
    }, 700)

    return () => window.clearTimeout(timer)
  }, [values, enabled])
}
