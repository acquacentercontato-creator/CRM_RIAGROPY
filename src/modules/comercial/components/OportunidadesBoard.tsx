import { useState } from 'react'
import { Button, Chip, Grid, Paper, Stack, Typography } from '@mui/material'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import { useOportunidades } from '@/modules/comercial/hooks/useComercialData'
import type { Oportunidade } from '@/modules/comercial/types'
import { ModuleAttachmentsTab } from '@/shared/attachments'
import { useAttachments } from '@/shared/attachments/hooks/useAttachments'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

const colorByLevel = {
  ALTA: 'success',
  MEDIA: 'warning',
  BAIXA: 'default',
} as const

const OportunidadeCard = ({ item }: { item: Oportunidade }) => {
  const ts = useTranslationService()
  const [showAnexos, setShowAnexos] = useState(false)
  const { stats } = useAttachments({ entityId: item.id, moduloContext: 'COMERCIAL' })

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={1}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="h6">{item.clienteNome}</Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AttachFileIcon />}
            onClick={() => setShowAnexos((v) => !v)}
          >
            {stats.total > 0 ? ts('attachments.count', { count: stats.total }) : ts('attachments.tab')}
          </Button>
        </Stack>
        <Chip
          size="small"
          label={ts('oportunidades.level', { nivel: item.nivel })}
          color={colorByLevel[item.nivel]}
          sx={{ width: 'fit-content' }}
        />
        <Typography variant="body2" color="text.secondary">
          {ts('oportunidades.statusCliente', { status: item.statusCliente })}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {ts('oportunidades.ultimaVisita', { valor: item.ultimaVisita || ts('oportunidades.semRegistro') })}
        </Typography>
        <Typography variant="body2">{item.resultadoUltimaVisita || ts('oportunidades.semResultado')}</Typography>

        {showAnexos && (
          <ModuleAttachmentsTab
            entityId={item.id}
            entityNome={item.clienteNome}
            moduloContext="COMERCIAL"
          />
        )}
      </Stack>
    </Paper>
  )
}

export const OportunidadesBoard = () => {
  const { data = [] } = useOportunidades()
  const ts = useTranslationService()

  return (
    <Grid container spacing={2}>
      {data.map((item) => (
        <Grid key={item.id} size={{ xs: 12, md: 6, lg: 4 }}>
          <OportunidadeCard item={item} />
        </Grid>
      ))}
      {data.length === 0 && (
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 2 }}>
            <Typography color="text.secondary">{ts('oportunidades.empty')}</Typography>
          </Paper>
        </Grid>
      )}
    </Grid>
  )
}
