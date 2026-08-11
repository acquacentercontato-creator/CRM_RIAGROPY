import { Box, Grid, Typography } from '@mui/material'
import type { HeatmapCell } from '@/modules/dashboard/types/dashboardTypes'
import { DashboardWidgetCard } from '@/modules/dashboard/components/DashboardWidgetCard'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

type HeatmapWidgetProps = {
  title: string
  cells: HeatmapCell[]
}

export const HeatmapWidget = ({ title, cells }: HeatmapWidgetProps) => {
  const ts = useTranslationService()
  const max = Math.max(1, ...cells.map((cell) => cell.value))

  return (
    <DashboardWidgetCard title={title} subtitle={ts('dashboard.charts.heatmapSubtitle')}>
      <Grid container spacing={0.5}>
        {cells.map((cell) => {
          const intensity = cell.value / max
          return (
            <Grid key={`${cell.x}-${cell.y}`} size={{ xs: 2 }}>
              <Box
                sx={{
                  p: 0.75,
                  borderRadius: 1,
                  backgroundColor: `rgba(25, 118, 210, ${Math.max(0.1, intensity)})`,
                }}
              >
                <Typography variant="caption" sx={{ display: 'block', lineHeight: 1 }} color="common.white">
                  {cell.x}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', lineHeight: 1 }} color="common.white">
                  {cell.y}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ display: 'block', lineHeight: 1, fontWeight: 700 }}
                  color="common.white"
                >
                  {cell.value}
                </Typography>
              </Box>
            </Grid>
          )
        })}
      </Grid>
    </DashboardWidgetCard>
  )
}
