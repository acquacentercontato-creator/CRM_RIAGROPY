import { Button, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'

type CrudSectionHeaderProps = {
  title: string
  actionLabel: string
  onAction: () => void
  leftSlot?: ReactNode
}

export const CrudSectionHeader = ({
  title,
  actionLabel,
  onAction,
  leftSlot,
}: CrudSectionHeaderProps) => {
  return (
    <Stack direction="row" sx={{ mb: 2, justifyContent: 'space-between', alignItems: 'center' }}>
      <Stack spacing={0.25}>
        <Typography variant="h6">{title}</Typography>
        {leftSlot}
      </Stack>
      <Button variant="contained" onClick={onAction}>
        {actionLabel}
      </Button>
    </Stack>
  )
}
