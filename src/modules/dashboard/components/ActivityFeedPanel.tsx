import { List, ListItem, ListItemText, Typography } from '@mui/material'
import type { DashboardActivityItem } from '@/modules/dashboard/types/dashboardTypes'
import { DashboardWidgetCard } from '@/modules/dashboard/components/DashboardWidgetCard'

type ActivityFeedPanelProps = {
  items: DashboardActivityItem[]
}

export const ActivityFeedPanel = ({ items }: ActivityFeedPanelProps) => {
  return (
    <DashboardWidgetCard title="Feed de Atividades" subtitle="Atualizacoes operacionais">
      {items.length === 0 ? (
        <Typography color="text.secondary">Sem atividades recentes.</Typography>
      ) : (
        <List dense>
          {items.slice(0, 20).map((item) => (
            <ListItem key={item.id} divider>
              <ListItemText
                primary={item.title}
                secondary={`${item.message} | ${new Date(item.createdAt).toLocaleString()} | ${item.actorName}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </DashboardWidgetCard>
  )
}
