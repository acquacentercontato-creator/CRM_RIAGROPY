import { ComercialShell } from '@/modules/comercial/components/ComercialShell'
import { ClientesCrud } from '@/modules/comercial/components/ClientesCrud'

export const ClientesPage = () => {
  return (
    <ComercialShell>
      <ClientesCrud />
    </ComercialShell>
  )
}
