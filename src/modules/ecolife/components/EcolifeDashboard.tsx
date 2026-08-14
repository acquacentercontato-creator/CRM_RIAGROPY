import { Grid, Paper, Stack, Typography } from '@mui/material'
import type { EcolifeDiagnostic } from '@/modules/ecolife/types/ecolifeTypes'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

export const EcolifeDashboard = ({ rows }: { rows: EcolifeDiagnostic[] }) => {
  const ts = useTranslationService()
  const values = [
    ['diagnostics', rows.length],
    ['analysis', rows.filter((row) => row.status === 'EM_ANALISE').length],
    ['proposals', rows.filter((row) => row.status === 'PROPOSTA').length],
    ['negotiations', rows.filter((row) => row.status === 'NEGOCIACAO').length],
    ['sold', rows.filter((row) => row.status === 'VENDIDO').length],
    [
      'revenue',
      new Intl.NumberFormat(ts('ecolife.locale'), {
        style: 'currency',
        currency: 'PYG',
        maximumFractionDigits: 0,
      }).format(
        rows
          .filter((row) => row.status !== 'IMPLANTACAO')
          .reduce((total, row) => total + row.expectedRevenue, 0)
      ),
    ],
  ] as const
  return (
    <Grid container spacing={1.5}>
      {values.map(([key, value]) => (
        <Grid key={key} size={{ xs: 6, md: 2 }}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Stack>
              <Typography variant="caption" color="text.secondary">
                {ts(`ecolife.dashboard.${key}`)}
              </Typography>
              <Typography variant="h6">{value}</Typography>
            </Stack>
          </Paper>
        </Grid>
      ))}
    </Grid>
  )
}
