import { List, ListItem, ListItemText, Typography } from '@mui/material'
import type { DashboardQueueItem } from '@/modules/dashboard/types/dashboardTypes'
import { DashboardWidgetCard } from '@/modules/dashboard/components/DashboardWidgetCard'

type QueuePanelProps = {
  title: string
  subtitle: string
  items: DashboardQueueItem[]
}

export const QueuePanel = ({ title, subtitle, items }: QueuePanelProps) => {
  return (
    <DashboardWidgetCard title={title} subtitle={subtitle}>
      {items.length === 0 ? (
        <Typography color="text.secondary">Nenhum item encontrado.</Typography>
      ) : (
        <List dense>
          {items.slice(0, 20).map((item) => (
            <ListItem key={item.id} divider>
              <ListItemText
                primary={`${item.codigo} | ${item.etapa}`}
                secondary={`Responsavel: ${item.responsavel} | Prazo: ${item.prazo || 'N/D'} | Dias parado: ${item.diasParado} | ${item.status}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </DashboardWidgetCard>
  )
}
