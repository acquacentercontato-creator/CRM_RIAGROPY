import { Grid, Paper, Typography } from '@mui/material'

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
  { key: 'total', label: 'Total Obras' },
  { key: 'criadas', label: 'Obra Criada' },
  { key: 'planejamento', label: 'Planejamento' },
  { key: 'execucao', label: 'Execucao' },
  { key: 'acompanhamento', label: 'Acompanhamento' },
  { key: 'entrega', label: 'Entrega' },
  { key: 'encerramento', label: 'Encerramento' },
] as const

export const ObrasDashboard = ({ metrics }: ObrasDashboardProps) => {
  return (
    <Grid container spacing={2}>
      {cards.map((card) => (
        <Grid key={card.key} size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {card.label}
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
