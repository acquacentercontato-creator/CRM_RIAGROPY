import { useEffect } from 'react'
import { AppRouter } from '@/routes/AppRouter'
import { BPEOrchestrator } from '@/shared/bpe'
import { AutomationService } from '@/shared/crm-automation'

export const App = () => {
  // Inicializar BPE e CRM Automation Engine uma única vez
  useEffect(() => {
    BPEOrchestrator.init()
    AutomationService.start()
  }, [])

  return <AppRouter />
}
