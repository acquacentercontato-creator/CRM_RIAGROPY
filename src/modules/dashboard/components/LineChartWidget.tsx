import { Box } from '@mui/material'
import type { ChartPoint } from '@/modules/dashboard/types/dashboardTypes'
import { DashboardWidgetCard } from '@/modules/dashboard/components/DashboardWidgetCard'

type LineChartWidgetProps = {
  title: string
  points: ChartPoint[]
}

export const LineChartWidget = ({ title, points }: LineChartWidgetProps) => {
  const max = Math.max(1, ...points.map((point) => point.value))
  const width = 520
  const height = 220

  const path = points
    .map((point, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * (width - 30) + 15
      const y = height - (point.value / max) * (height - 30) - 15
      return `${index === 0 ? 'M' : 'L'}${x} ${y}`
    })
    .join(' ')

  return (
    <DashboardWidgetCard title={title} subtitle="Grafico de Linha">
      <Box component="svg" viewBox={`0 0 ${width} ${height}`} sx={{ width: '100%', height: 220 }}>
        <path d={path} stroke="#2e7d32" strokeWidth={3} fill="none" />
      </Box>
    </DashboardWidgetCard>
  )
}
