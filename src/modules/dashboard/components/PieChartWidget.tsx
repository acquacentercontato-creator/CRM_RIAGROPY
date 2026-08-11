import { Box, Stack, Typography } from '@mui/material'
import type { ChartPoint } from '@/modules/dashboard/types/dashboardTypes'
import { DashboardWidgetCard } from '@/modules/dashboard/components/DashboardWidgetCard'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

type PieChartWidgetProps = {
  title: string
  points: ChartPoint[]
}

const palette = ['#00695c', '#f57c00', '#6a1b9a', '#0277bd', '#2e7d32', '#d32f2f']

export const PieChartWidget = ({ title, points }: PieChartWidgetProps) => {
  const ts = useTranslationService()
  const total = Math.max(1, points.reduce((acc, item) => acc + item.value, 0))

  const slices = points.reduce<{
    cursor: number
    items: Array<{ key: string; path: string; color: string; label: string; value: number }>
  }>(
    (acc, point, index) => {
      const start = acc.cursor
      const value = point.value / total
      const end = start + value
      const largeArc = value > 0.5 ? 1 : 0

      const x1 = 80 + 70 * Math.cos(2 * Math.PI * start)
      const y1 = 80 + 70 * Math.sin(2 * Math.PI * start)
      const x2 = 80 + 70 * Math.cos(2 * Math.PI * end)
      const y2 = 80 + 70 * Math.sin(2 * Math.PI * end)

      const path = `M 80 80 L ${x1} ${y1} A 70 70 0 ${largeArc} 1 ${x2} ${y2} Z`

      return {
        cursor: end,
        items: [
          ...acc.items,
          {
            key: point.label,
            path,
            color: palette[index % palette.length],
            label: point.label,
            value: point.value,
          },
        ],
      }
    },
    { cursor: 0, items: [] },
  ).items

  return (
    <DashboardWidgetCard title={title} subtitle={ts('dashboard.charts.pieSubtitle')}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: 'center' }}>
        <Box component="svg" viewBox="0 0 160 160" sx={{ width: 160, height: 160 }}>
          {slices.map((slice) => (
            <path key={slice.key} d={slice.path} fill={slice.color} stroke="#fff" strokeWidth={1} />
          ))}
        </Box>
        <Stack spacing={0.75}>
          {slices.map((slice) => (
            <Stack key={slice.key} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: slice.color }} />
              <Typography variant="body2">{ts(slice.label)}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {slice.value}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </DashboardWidgetCard>
  )
}
