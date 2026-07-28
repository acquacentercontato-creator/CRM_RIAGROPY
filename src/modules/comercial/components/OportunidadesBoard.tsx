import { Chip, Grid, Paper, Stack, Typography } from '@mui/material'
import { useOportunidades } from '@/modules/comercial/hooks/useComercialData'

const colorByLevel = {
  ALTA: 'success',
  MEDIA: 'warning',
  BAIXA: 'default',
} as const

export const OportunidadesBoard = () => {
  const { data = [] } = useOportunidades()

  return (
    <Grid container spacing={2}>
      {data.map((item) => (
        <Grid key={item.id} size={{ xs: 12, md: 6, lg: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Stack spacing={1}>
              <Typography variant="h6">{item.clienteNome}</Typography>
              <Chip
                size="small"
                label={`Nivel ${item.nivel}`}
                color={colorByLevel[item.nivel]}
                sx={{ width: 'fit-content' }}
              />
              <Typography variant="body2" color="text.secondary">
                Status cliente: {item.statusCliente}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ultima visita: {item.ultimaVisita || 'Sem registro'}
              </Typography>
              <Typography variant="body2">{item.resultadoUltimaVisita || 'Sem resultado'}</Typography>
            </Stack>
          </Paper>
        </Grid>
      ))}
      {data.length === 0 && (
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 2 }}>
            <Typography color="text.secondary">Sem oportunidades no momento.</Typography>
          </Paper>
        </Grid>
      )}
    </Grid>
  )
}
