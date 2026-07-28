import { Paper, Stack, Typography } from '@mui/material'
import type { PropsWithChildren } from 'react'

type DashboardWidgetCardProps = PropsWithChildren<{
  title: string
  subtitle?: string
}>

export const DashboardWidgetCard = ({ title, subtitle, children }: DashboardWidgetCardProps) => {
  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Stack spacing={1.5}>
        <Stack spacing={0.25}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Stack>
        {children}
      </Stack>
    </Paper>
  )
}
