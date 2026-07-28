import { ComercialShell } from '@/modules/comercial/components/ComercialShell'
import { VisitasCrud } from '@/modules/comercial/components/VisitasCrud'

export const VisitasPage = () => {
  return (
    <ComercialShell>
      <VisitasCrud />
    </ComercialShell>
  )
}
