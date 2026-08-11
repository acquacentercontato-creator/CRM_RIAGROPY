import { Chip, List, ListItem, ListItemText, Stack, Typography } from '@mui/material'
import type { NotificationRecord } from '@/shared/services/NotificationService'
import { DashboardWidgetCard } from '@/modules/dashboard/components/DashboardWidgetCard'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

type NotificationsPanelProps = {
  items: NotificationRecord[]
}

export const NotificationsPanel = ({ items }: NotificationsPanelProps) => {
  const ts = useTranslationService()

  return (
    <DashboardWidgetCard
      title={ts('dashboard.panels.notificationsTitle')}
      subtitle={ts('dashboard.panels.notificationsSubtitle')}
    >
      {items.length === 0 ? (
        <Typography color="text.secondary">{ts('dashboard.panels.noNotifications')}</Typography>
      ) : (
        <List dense>
          {items.slice(0, 20).map((item) => (
            <ListItem key={item.id} divider>
              <ListItemText
                primary={
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Chip size="small" label={item.level} />
                    <Typography variant="body2">{item.title}</Typography>
                  </Stack>
                }
                secondary={`${item.message} | ${new Date(item.createdAt).toLocaleString()}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </DashboardWidgetCard>
  )
}
