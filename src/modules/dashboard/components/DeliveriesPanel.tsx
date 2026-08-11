import { List, ListItem, ListItemText, Typography } from '@mui/material'
import type { DashboardDeliveryItem } from '@/modules/dashboard/types/dashboardTypes'
import { DashboardWidgetCard } from '@/modules/dashboard/components/DashboardWidgetCard'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

type DeliveriesPanelProps = {
  items: DashboardDeliveryItem[]
}

export const DeliveriesPanel = ({ items }: DeliveriesPanelProps) => {
  const ts = useTranslationService()

  return (
    <DashboardWidgetCard title={ts('dashboard.panels.deliveriesTitle')} subtitle={ts('dashboard.panels.deliveriesSubtitle')}>
      {items.length === 0 ? (
        <Typography color="text.secondary">{ts('dashboard.panels.noDeliveries')}</Typography>
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
