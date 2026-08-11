import { Alert, Paper, Stack, Tab, Tabs, Typography } from '@mui/material'
import { useState } from 'react'
import { ModuleAttachmentsTab } from '@/shared/attachments'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

export const RelatoriosPage = () => {
  const ts = useTranslationService()
  const [tab, setTab] = useState(0)

  return (
    <Stack spacing={2}>
      <Typography variant="h4">{ts('pages.relatorios.title')}</Typography>
      <Alert severity="info">{ts('common.foundationOnly')}</Alert>

      <Paper sx={{ p: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label={ts('pages.relatorios.title')} />
          <Tab label={ts('attachments.tab')} />
        </Tabs>

        {tab === 0 && (
          <Typography color="text.secondary">{ts('common.foundationOnly')}</Typography>
        )}

        {tab === 1 && (
          <ModuleAttachmentsTab
            entityId="relatorios-global"
            entityNome={ts('pages.relatorios.title')}
            moduloContext="COMERCIAL"
          />
        )}
      </Paper>
    </Stack>
  )
}
