import { useEffect } from 'react'
import { ImotoService } from '@/modules/imoto/services/ImotoService'
import type { ImotoLevantamentoForm } from '@/modules/imoto/types/imotoTypes'

export const useImotoDraft = (values: ImotoLevantamentoForm, enabled: boolean) => {
  useEffect(() => {
    if (!enabled) return

    const timer = window.setTimeout(() => {
      ImotoService.saveDraft(values)
    }, 700)

    return () => window.clearTimeout(timer)
  }, [values, enabled])
}
