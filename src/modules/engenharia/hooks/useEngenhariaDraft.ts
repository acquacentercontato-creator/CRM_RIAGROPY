import { useEffect } from 'react'
import { EngenhariaService } from '@/modules/engenharia/services/EngenhariaService'
import type { EngenhariaProjectForm } from '@/modules/engenharia/types/engenhariaTypes'

export const useEngenhariaDraft = (values: EngenhariaProjectForm, enabled: boolean) => {
  useEffect(() => {
    if (!enabled) return

    const timer = window.setTimeout(() => {
      EngenhariaService.saveDraft(values)
    }, 700)

    return () => window.clearTimeout(timer)
  }, [values, enabled])
}
