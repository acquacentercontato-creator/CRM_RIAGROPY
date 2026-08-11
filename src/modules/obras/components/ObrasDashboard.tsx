import { Grid, Paper, Typography } from '@mui/material'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

type ObrasDashboardProps = {
  metrics: {
    total: number
    criadas: number
    planejamento: number
    execucao: number
    acompanhamento: number
    entrega: number
    encerramento: number
  }
}

const cards = [
  { key: 'total', label: 'obras.dashboard.total' },
  { key: 'criadas', label: 'obras.dashboard.criadas' },
  { key: 'planejamento', label: 'obras.dashboard.planejamento' },
  { key: 'execucao', label: 'obras.dashboard.execucao' },
  { key: 'acompanhamento', label: 'obras.dashboard.acompanhamento' },
  { key: 'entrega', label: 'obras.dashboard.entrega' },
  { key: 'encerramento', label: 'obras.dashboard.encerramento' },
] as const

export const ObrasDashboard = ({ metrics }: ObrasDashboardProps) => {
  const ts = useTranslationService()

  return (
    <Grid container spacing={2}>
      {cards.map((card) => (
        <Grid key={card.key} size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {ts(card.label)}
            </Typography>
            <Typography variant="h5" sx={{ mt: 1 }}>
              {metrics[card.key]}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  )
}
