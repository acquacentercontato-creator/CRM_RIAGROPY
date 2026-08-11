import { List, ListItem, ListItemText, Typography } from '@mui/material'
import type { DashboardLateItem } from '@/modules/dashboard/types/dashboardTypes'
import { DashboardWidgetCard } from '@/modules/dashboard/components/DashboardWidgetCard'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

type LateItemsPanelProps = {
  title: string
  subtitle: string
  items: DashboardLateItem[]
}

export const LateItemsPanel = ({ title, subtitle, items }: LateItemsPanelProps) => {
  const ts = useTranslationService()

  return (
    <DashboardWidgetCard title={title} subtitle={subtitle}>
      {items.length === 0 ? (
        <Typography color="text.secondary">{ts('dashboard.panels.noLateItems')}</Typography>
      ) : (
        <List dense>
          {items.map((item) => (
            <ListItem key={item.id} divider>
              <ListItemText
                primary={`${item.codigo} - ${item.cliente}`}
                secondary={ts('dashboard.panels.lateSecondary', {
                  prazo: item.prazo || ts('dashboard.panels.na'),
                  diasAtraso: item.diasAtraso,
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
