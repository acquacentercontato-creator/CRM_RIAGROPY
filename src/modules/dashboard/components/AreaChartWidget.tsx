import { Box } from '@mui/material'
import type { ChartPoint } from '@/modules/dashboard/types/dashboardTypes'
import { DashboardWidgetCard } from '@/modules/dashboard/components/DashboardWidgetCard'

type AreaChartWidgetProps = {
  title: string
  points: ChartPoint[]
}

export const AreaChartWidget = ({ title, points }: AreaChartWidgetProps) => {
  const max = Math.max(1, ...points.map((point) => point.value))
  const width = 520
  const height = 220

  const plotPoints = points.map((point, index) => {
    const x = (index / Math.max(points.length - 1, 1)) * (width - 30) + 15
    const y = height - (point.value / max) * (height - 30) - 15
    return { x, y }
  })

  const path = plotPoints.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`).join(' ')
  const area = `${path} L ${width - 15} ${height - 15} L 15 ${height - 15} Z`

  return (
    <DashboardWidgetCard title={title} subtitle="Grafico de Area">
      <Box component="svg" viewBox={`0 0 ${width} ${height}`} sx={{ width: '100%', height: 220 }}>
        <path d={area} fill="rgba(21, 101, 192, 0.2)" stroke="none" />
        <path d={path} stroke="#1565c0" strokeWidth={2.5} fill="none" />
      </Box>
    </DashboardWidgetCard>
  )
}
