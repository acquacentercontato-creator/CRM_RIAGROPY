import { Grid, Paper, Typography } from '@mui/material'

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
  { key: 'total', label: 'Total Projetos' },
  { key: 'aguardando', label: 'Aguardando Engenharia' },
  { key: 'emProjeto', label: 'Em Projeto' },
  { key: 'memorial', label: 'Aguardando Memorial' },
  { key: 'revisao', label: 'Em Revisao' },
  { key: 'completo', label: 'Projeto Completo' },
] as const

export const EngenhariaDashboard = ({ metrics }: EngenhariaDashboardProps) => {
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
