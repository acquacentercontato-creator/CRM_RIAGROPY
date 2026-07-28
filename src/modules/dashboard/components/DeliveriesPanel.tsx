import { List, ListItem, ListItemText, Typography } from '@mui/material'
import type { DashboardDeliveryItem } from '@/modules/dashboard/types/dashboardTypes'
import { DashboardWidgetCard } from '@/modules/dashboard/components/DashboardWidgetCard'

type DeliveriesPanelProps = {
  items: DashboardDeliveryItem[]
}

export const DeliveriesPanel = ({ items }: DeliveriesPanelProps) => {
  return (
    <DashboardWidgetCard title="Proximas Entregas" subtitle="Planejamento de entrega tecnica">
      {items.length === 0 ? (
        <Typography color="text.secondary">Sem entregas previstas.</Typography>
      ) : (
        <List dense>
          {items.map((item) => (
            <ListItem key={item.id} divider>
              <ListItemText primary={`${item.codigo} - ${item.cliente}`} secondary={`${item.data} | ${item.status} | ${item.responsavel}`} />
            </ListItem>
          ))}
        </List>
      )}
    </DashboardWidgetCard>
  )
}
