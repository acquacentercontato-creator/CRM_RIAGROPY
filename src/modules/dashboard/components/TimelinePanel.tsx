import { List, ListItem, ListItemText, Typography } from '@mui/material'
import type { TimelineEvent } from '@/shared/types/core'
import { DashboardWidgetCard } from '@/modules/dashboard/components/DashboardWidgetCard'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

type TimelinePanelProps = {
  items: TimelineEvent[]
}

export const TimelinePanel = ({ items }: TimelinePanelProps) => {
  const ts = useTranslationService()

  return (
    <DashboardWidgetCard title={ts('dashboard.panels.timelineTitle')} subtitle={ts('dashboard.panels.timelineSubtitle')}>
      {items.length === 0 ? (
        <Typography color="text.secondary">{ts('dashboard.panels.noTimeline')}</Typography>
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
