/**
 * Widget de métricas do pipeline para o Dashboard executivo
 */

import {
  Box,
  Chip,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import BlockIcon from '@mui/icons-material/Block'
import GroupsIcon from '@mui/icons-material/Groups'
import TimelineIcon from '@mui/icons-material/Timeline'
import WarningIcon from '@mui/icons-material/Warning'
import type { PipelineMetrics } from '@/shared/workflow/pipeline/WorkflowPipelineTypes'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

interface WorkflowPipelineMetricsProps {
  metrics: PipelineMetrics
}

export const WorkflowPipelineMetrics = ({ metrics }: WorkflowPipelineMetricsProps) => {
  const ts = useTranslationService()

  const kpis = [
    { label: ts('workflow.dashboard.bloqueados'), value: metrics.bloqueados, icon: <BlockIcon color="error" />, color: 'error.main' },
    { label: ts('workflow.dashboard.atrasados'), value: metrics.atrasados, icon: <WarningIcon color="warning" />, color: 'warning.main' },
    { label: ts('workflow.dashboard.aguardando'), value: metrics.aguardandoAcao, icon: <TimelineIcon color="info" />, color: 'info.main' },
    { label: ts('workflow.dashboard.porEtapa'), value: Object.keys(metrics.porEtapa).length, icon: <GroupsIcon color="primary" />, color: 'primary.main' },
  ]

  return (
    <Stack spacing={2}>
      {/* KPIs compactos */}
      <Grid container spacing={1.5}>
        {kpis.map((kpi) => (
          <Grid key={kpi.label} size={{ xs: 6, md: 3 }}>
            <Paper variant="outlined" sx={{ p: 1.5 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                {kpi.icon}
                <Box>
                  <Typography variant="h5" sx={{ color: kpi.color, fontWeight: 700 }}>
                    {kpi.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {kpi.label}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Projetos por etapa */}
      {Object.keys(metrics.porEtapa).length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {ts('workflow.dashboard.porEtapa')}
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
            {Object.entries(metrics.porEtapa).map(([etapa, count]) => (
              <Chip
                key={etapa}
                label={`${ts(`workflow.steps.${etapa}`)}: ${count}`}
                size="small"
                variant="outlined"
              />
            ))}
          </Stack>
        </Box>
      )}

      {/* Projetos atrasados */}
      {metrics.projetosAtrasados.length > 0 && (
        <Box>
          <Typography variant="subtitle2" color="error" sx={{ mb: 0.5 }}>
            {ts('workflow.dashboard.atrasados')}
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ py: 0.5 }}>{ts('common.code')}</TableCell>
                <TableCell sx={{ py: 0.5 }}>{ts('workflow.dashboard.etapa')}</TableCell>
                <TableCell sx={{ py: 0.5 }}>{ts('workflow.dashboard.diasAtraso')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {metrics.projetosAtrasados.slice(0, 5).map((item) => (
                <TableRow key={item.id}>
                  <TableCell sx={{ py: 0.5 }}>
                    <Typography variant="caption">{item.codigo}</Typography>
                  </TableCell>
                  <TableCell sx={{ py: 0.5 }}>
                    <Typography variant="caption">{ts(`workflow.steps.${item.etapa}`)}</Typography>
                  </TableCell>
                  <TableCell sx={{ py: 0.5 }}>
                    <Chip label={item.diasAtraso} size="small" color="error" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {/* Projetos bloqueados */}
      {metrics.projetosBloqueados.length > 0 && (
        <Box>
          <Typography variant="subtitle2" color="error" sx={{ mb: 0.5 }}>
            {ts('workflow.dashboard.bloqueados')}
          </Typography>
          <Stack spacing={0.5}>
            {metrics.projetosBloqueados.slice(0, 5).map((item) => (
              <Paper key={item.id} variant="outlined" sx={{ p: 1 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <BlockIcon color="error" fontSize="small" />
                  <Typography variant="caption" sx={{ flex: 1 }}>
                    {item.codigo} — {item.cliente}
                  </Typography>
                  <Chip
                    label={ts(`workflow.steps.${item.etapa}`)}
                    size="small"
                    color="error"
                    variant="outlined"
                  />
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}

      {metrics.totalProjetos === 0 && (
        <Typography color="text.secondary">{ts('workflow.dashboard.semProjetos')}</Typography>
      )}
    </Stack>
  )
}
