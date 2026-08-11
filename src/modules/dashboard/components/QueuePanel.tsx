import { List, ListItem, ListItemText, Typography } from '@mui/material'
import type { DashboardQueueItem } from '@/modules/dashboard/types/dashboardTypes'
import { DashboardWidgetCard } from '@/modules/dashboard/components/DashboardWidgetCard'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

type QueuePanelProps = {
  title: string
  subtitle: string
  items: DashboardQueueItem[]
}

export const QueuePanel = ({ title, subtitle, items }: QueuePanelProps) => {
  const ts = useTranslationService()

  return (
    <DashboardWidgetCard title={title} subtitle={subtitle}>
      {items.length === 0 ? (
        <Typography color="text.secondary">{ts('dashboard.panels.noItems')}</Typography>
      ) : (
        <List dense>
          {items.slice(0, 20).map((item) => (
            <ListItem key={item.id} divider>
              <ListItemText
                primary={`${item.codigo} | ${item.etapa}`}
                secondary={ts('dashboard.panels.queueSecondary', {
                  responsavel: item.responsavel,
                  prazo: item.prazo || ts('dashboard.panels.na'),
                  diasParado: item.diasParado,
                  status: item.status,
                })}
              />
            </ListItem>
          ))}
        </List>
      )}
    </DashboardWidgetCard>
  )
}
