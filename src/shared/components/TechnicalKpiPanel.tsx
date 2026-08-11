/**
 * KPIs técnicos para Engenharia, Obras e Assistência
 */

import { Grid, Paper, Stack, Typography } from '@mui/material'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import BuildIcon from '@mui/icons-material/Build'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import EngineeringIcon from '@mui/icons-material/Engineering'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'
import TimerIcon from '@mui/icons-material/Timer'
import WarningIcon from '@mui/icons-material/Warning'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

interface TechnicalKpiPanelProps {
  engenharia: {
    emRevisao: number
    aguardandoAprovacao: number
    liberados: number
    tempoMedioDias: number
    slaVencidos: number
  }
  obras: {
    emAndamento: number
    atrasadas: number
    emEntrega: number
    tempoMedioDias: number
    slaVencidos: number
  }
  assistencia: {
    abertas: number
    emSla: number
    garantias: number
    tempoMedioDias: number
    slaVencidos: number
  }
}

const KpiCard = ({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  color: string
}) => (
  <Paper variant="outlined" sx={{ p: 1.5 }}>
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      {icon}
      <Stack>
        <Typography variant="h6" sx={{ color, fontWeight: 700, lineHeight: 1 }}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, lineHeight: 1.2 }}>
          {label}
        </Typography>
      </Stack>
    </Stack>
  </Paper>
)

export const TechnicalKpiPanel = ({ engenharia, obras, assistencia }: TechnicalKpiPanelProps) => {
  const ts = useTranslationService()

  return (
    <Stack spacing={1.5}>
      {/* Engenharia */}
      <Typography variant="subtitle2" color="primary">{ts('technical.kpi.eng.title')}</Typography>
      <Grid container spacing={1}>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <KpiCard label={ts('technical.kpi.eng.emRevisao')} value={engenharia.emRevisao} icon={<EngineeringIcon color="warning" />} color="warning.main" />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <KpiCard label={ts('technical.kpi.eng.aguardandoAprovacao')} value={engenharia.aguardandoAprovacao} icon={<TimerIcon color="info" />} color="info.main" />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <KpiCard label={ts('technical.kpi.eng.liberados')} value={engenharia.liberados} icon={<CheckCircleIcon color="success" />} color="success.main" />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <KpiCard label={ts('technical.kpi.eng.tempoMedio')} value={`${engenharia.tempoMedioDias}d`} icon={<AccessTimeIcon color="secondary" />} color="secondary.main" />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <KpiCard label={ts('technical.kpi.eng.slaVencidos')} value={engenharia.slaVencidos} icon={<WarningIcon color="error" />} color="error.main" />
        </Grid>
      </Grid>

      {/* Obras */}
      <Typography variant="subtitle2" color="primary" sx={{ mt: 0.5 }}>{ts('technical.kpi.obra.title')}</Typography>
      <Grid container spacing={1}>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <KpiCard label={ts('technical.kpi.obra.emAndamento')} value={obras.emAndamento} icon={<BuildIcon color="primary" />} color="primary.main" />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <KpiCard label={ts('technical.kpi.obra.atrasadas')} value={obras.atrasadas} icon={<WarningIcon color="error" />} color="error.main" />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <KpiCard label={ts('technical.kpi.obra.emEntrega')} value={obras.emEntrega} icon={<CheckCircleIcon color="success" />} color="success.main" />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <KpiCard label={ts('technical.kpi.obra.tempoMedio')} value={`${obras.tempoMedioDias}d`} icon={<AccessTimeIcon color="secondary" />} color="secondary.main" />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <KpiCard label={ts('technical.kpi.obra.slaVencidos')} value={obras.slaVencidos} icon={<WarningIcon color="warning" />} color="warning.main" />
        </Grid>
      </Grid>

      {/* Assistência */}
      <Typography variant="subtitle2" color="primary" sx={{ mt: 0.5 }}>{ts('technical.kpi.ass.title')}</Typography>
      <Grid container spacing={1}>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <KpiCard label={ts('technical.kpi.ass.abertas')} value={assistencia.abertas} icon={<SupportAgentIcon color="error" />} color="error.main" />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <KpiCard label={ts('technical.kpi.ass.emSla')} value={assistencia.emSla} icon={<TimerIcon color="warning" />} color="warning.main" />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <KpiCard label={ts('technical.kpi.ass.garantias')} value={assistencia.garantias} icon={<CheckCircleIcon color="success" />} color="success.main" />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <KpiCard label={ts('technical.kpi.ass.tempoMedio')} value={`${assistencia.tempoMedioDias}d`} icon={<AccessTimeIcon color="secondary" />} color="secondary.main" />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <KpiCard label={ts('technical.kpi.ass.slaVencidos')} value={assistencia.slaVencidos} icon={<WarningIcon color="error" />} color="error.main" />
        </Grid>
      </Grid>
    </Stack>
  )
}
