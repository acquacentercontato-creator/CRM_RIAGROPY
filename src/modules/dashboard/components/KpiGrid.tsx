import { Grid, Typography } from '@mui/material'
import type { DashboardKpi } from '@/modules/dashboard/types/dashboardTypes'
import { DashboardWidgetCard } from '@/modules/dashboard/components/DashboardWidgetCard'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

type KpiGridProps = {
  kpis: DashboardKpi[]
}

export const KpiGrid = ({ kpis }: KpiGridProps) => {
  const ts = useTranslationService()

  return (
    <Grid container spacing={2}>
      {kpis.map((kpi) => (
        <Grid key={kpi.key} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <DashboardWidgetCard title={ts(kpi.label)}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {kpi.value}
            </Typography>
          </DashboardWidgetCard>
        </Grid>
      ))}
    </Grid>
  )
}
