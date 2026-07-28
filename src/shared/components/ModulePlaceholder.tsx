import { Paper, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

type ModulePlaceholderProps = {
  titleKey: string
}

export const ModulePlaceholder = ({ titleKey }: ModulePlaceholderProps) => {
  const { t } = useTranslation()

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={1}>
        <Typography variant="h4">{t(titleKey)}</Typography>
        <Typography color="text.secondary">{t('common.foundationOnly')}</Typography>
      </Stack>
    </Paper>
  )
}
