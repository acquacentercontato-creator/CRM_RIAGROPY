import { List, ListItem, ListItemText, Typography } from '@mui/material'
import type { TimelineEvent } from '@/shared/types/core'
import { DashboardWidgetCard } from '@/modules/dashboard/components/DashboardWidgetCard'

type TimelinePanelProps = {
  items: TimelineEvent[]
}

export const TimelinePanel = ({ items }: TimelinePanelProps) => {
  return (
    <DashboardWidgetCard title="Timeline Geral" subtitle="Eventos consolidados do sistema">
      {items.length === 0 ? (
        <Typography color="text.secondary">Sem eventos no periodo.</Typography>
      ) : (
        <List dense>
          {items.slice(0, 20).map((item) => (
            <ListItem key={item.id} divider>
              <ListItemText
                primary={item.message}
                secondary={`${new Date(item.createdAt).toLocaleString()} | ${item.actorName}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </DashboardWidgetCard>
  )
}
