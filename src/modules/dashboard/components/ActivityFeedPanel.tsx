import { List, ListItem, ListItemText, Typography } from '@mui/material'
import type { DashboardActivityItem } from '@/modules/dashboard/types/dashboardTypes'
import { DashboardWidgetCard } from '@/modules/dashboard/components/DashboardWidgetCard'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

type ActivityFeedPanelProps = {
  items: DashboardActivityItem[]
}

export const ActivityFeedPanel = ({ items }: ActivityFeedPanelProps) => {
  const ts = useTranslationService()

  return (
    <DashboardWidgetCard title={ts('dashboard.panels.feedTitle')} subtitle={ts('dashboard.panels.feedSubtitle')}>
      {items.length === 0 ? (
        <Typography color="text.secondary">{ts('dashboard.panels.noFeed')}</Typography>
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
