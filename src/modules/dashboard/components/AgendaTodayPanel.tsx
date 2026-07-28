import { List, ListItem, ListItemText, Typography } from '@mui/material'
import type { DashboardAgendaItem } from '@/modules/dashboard/types/dashboardTypes'
import { DashboardWidgetCard } from '@/modules/dashboard/components/DashboardWidgetCard'

type AgendaTodayPanelProps = {
  items: DashboardAgendaItem[]
}

export const AgendaTodayPanel = ({ items }: AgendaTodayPanelProps) => {
  return (
    <DashboardWidgetCard title="Agenda do Dia" subtitle="Compromissos comerciais de hoje">
      {items.length === 0 ? (
        <Typography color="text.secondary">Sem compromissos para hoje.</Typography>
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
