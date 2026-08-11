import { Paper, Stack, Typography } from '@mui/material'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

type ModulePlaceholderProps = {
  titleKey: string
}

export const ModulePlaceholder = ({ titleKey }: ModulePlaceholderProps) => {
  const ts = useTranslationService()

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={1}>
        <Typography variant="h4">{ts(titleKey)}</Typography>
        <Typography color="text.secondary">{ts('common.foundationOnly')}</Typography>
      </Stack>
    </Paper>
  )
}
