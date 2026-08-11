import { Grid, Paper, Typography } from '@mui/material'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

type EngenhariaDashboardProps = {
  metrics: {
    total: number
    aguardando: number
    emProjeto: number
    memorial: number
    revisao: number
    completo: number
  }
}

const cards = [
  { key: 'total', label: 'engenharia.dashboard.total' },
  { key: 'aguardando', label: 'engenharia.dashboard.aguardando' },
  { key: 'emProjeto', label: 'engenharia.dashboard.emProjeto' },
  { key: 'memorial', label: 'engenharia.dashboard.memorial' },
  { key: 'revisao', label: 'engenharia.dashboard.revisao' },
  { key: 'completo', label: 'engenharia.dashboard.completo' },
] as const

export const EngenhariaDashboard = ({ metrics }: EngenhariaDashboardProps) => {
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
