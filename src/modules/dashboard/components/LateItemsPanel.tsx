import { List, ListItem, ListItemText, Typography } from '@mui/material'
import type { DashboardLateItem } from '@/modules/dashboard/types/dashboardTypes'
import { DashboardWidgetCard } from '@/modules/dashboard/components/DashboardWidgetCard'

type LateItemsPanelProps = {
  title: string
  subtitle: string
  items: DashboardLateItem[]
}

export const LateItemsPanel = ({ title, subtitle, items }: LateItemsPanelProps) => {
  return (
    <DashboardWidgetCard title={title} subtitle={subtitle}>
      {items.length === 0 ? (
        <Typography color="text.secondary">Sem registros atrasados.</Typography>
      ) : (
        <List dense>
          {items.map((item) => (
            <ListItem key={item.id} divider>
              <ListItemText
                primary={`${item.codigo} - ${item.cliente}`}
                secondary={`Prazo: ${item.prazo || 'N/D'} | Atraso: ${item.diasAtraso} dia(s) | ${item.status}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </DashboardWidgetCard>
  )
}
