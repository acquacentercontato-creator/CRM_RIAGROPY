import { ComercialShell } from '@/modules/comercial/components/ComercialShell'
import { AgendaCrud } from '@/modules/comercial/components/AgendaCrud'

export const AgendaPage = () => {
  return (
    <ComercialShell>
      <AgendaCrud />
    </ComercialShell>
  )
}
