import { List, ListItem, ListItemText, Typography } from '@mui/material'
import type { DashboardAgendaItem } from '@/modules/dashboard/types/dashboardTypes'
import { DashboardWidgetCard } from '@/modules/dashboard/components/DashboardWidgetCard'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

type AgendaTodayPanelProps = {
  items: DashboardAgendaItem[]
}

export const AgendaTodayPanel = ({ items }: AgendaTodayPanelProps) => {
  const ts = useTranslationService()

  return (
    <DashboardWidgetCard title={ts('dashboard.panels.agendaTitle')} subtitle={ts('dashboard.panels.agendaSubtitle')}>
      {items.length === 0 ? (
        <Typography color="text.secondary">{ts('dashboard.panels.noAgenda')}</Typography>
      ) : (
        <List dense>
          {items.map((item) => (
            <ListItem key={item.id} divider>
              <ListItemText primary={`${item.hora} - ${item.titulo}`} secondary={`${item.clienteNome} | ${item.tipo} | ${item.status}`} />
            </ListItem>
          ))}
        </List>
      )}
    </DashboardWidgetCard>
  )
}
