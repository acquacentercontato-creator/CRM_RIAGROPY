import { List, ListItem, ListItemText, Paper, Typography } from '@mui/material'
import type { TimelineEvent } from '@/shared/types/core'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

type ImotoTimelineProps = {
  events: TimelineEvent[]
}

export const ImotoTimeline = ({ events }: ImotoTimelineProps) => {
  const ts = useTranslationService()

  if (events.length === 0) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography color="text.secondary">{ts('timeline.empty')}</Typography>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: 1 }}>
      <List>
        {events.map((event) => (
          <ListItem key={event.id} divider>
            <ListItemText
              primary={ts(`imoto.timeline.events.${event.type}`)}
              secondary={`${ts(`imoto.timeline.types.${event.type}`)} | ${new Date(event.createdAt).toLocaleString(ts('imoto.locale'))} | ${event.actorName}`}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  )
}
