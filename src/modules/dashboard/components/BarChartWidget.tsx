import { Box, Stack, Typography } from '@mui/material'
import type { ChartPoint } from '@/modules/dashboard/types/dashboardTypes'
import { DashboardWidgetCard } from '@/modules/dashboard/components/DashboardWidgetCard'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

type BarChartWidgetProps = {
  title: string
  points: ChartPoint[]
}

export const BarChartWidget = ({ title, points }: BarChartWidgetProps) => {
  const ts = useTranslationService()
  const max = Math.max(1, ...points.map((point) => point.value))

  return (
    <DashboardWidgetCard title={title} subtitle={ts('dashboard.charts.barSubtitle')}>
      <Stack spacing={1.25}>
        {points.map((point) => (
          <Box key={point.label}>
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
              <Typography variant="body2">{ts(point.label)}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {point.value}
              </Typography>
            </Stack>
            <Box sx={{ mt: 0.5, backgroundColor: 'rgba(0,0,0,0.08)', height: 8, borderRadius: 4 }}>
              <Box
                sx={{
                  width: `${(point.value / max) * 100}%`,
                  backgroundColor: '#1565c0',
                  height: '100%',
                  borderRadius: 4,
                }}
              />
            </Box>
          </Box>
        ))}
      </Stack>
    </DashboardWidgetCard>
  )
}
