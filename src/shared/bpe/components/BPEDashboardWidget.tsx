/**
 * Widget do BPE para o Dashboard — métricas de aprovações, tarefas e bloqueios
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
import AssignmentIcon from '@mui/icons-material/Assignment'
import BlockIcon from '@mui/icons-material/Block'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import PersonOffIcon from '@mui/icons-material/PersonOff'
import WarningIcon from '@mui/icons-material/Warning'
import type { BPEDashboardMetrics } from '@/shared/bpe/BPETypes'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

interface BPEDashboardWidgetProps {
  metrics: BPEDashboardMetrics
}

export const BPEDashboardWidget = ({ metrics }: BPEDashboardWidgetProps) => {
  const ts = useTranslationService()

  const kpis = [
    {
      label: ts('bpe.dashboard.aguardandoAprovacao'),
      value: metrics.aguardandoAprovacao.length,
      icon: <HourglassEmptyIcon color="warning" />,
      color: 'warning.main',
    },
    {
      label: ts('bpe.dashboard.aguardandoResponsavel'),
      value: metrics.aguardandoResponsavel.length,
      icon: <PersonOffIcon color="error" />,
      color: 'error.main',
    },
    {
      label: ts('bpe.dashboard.bloqueados'),
      value: metrics.bloqueados.length,
      icon: <BlockIcon color="error" />,
      color: 'error.main',
    },
    {
      label: ts('bpe.dashboard.slaVencido'),
      value: metrics.slaVencido.length,
      icon: <WarningIcon color="warning" />,
      color: 'warning.main',
    },
    {
      label: ts('bpe.dashboard.tarefasPendentes'),
      value: metrics.tarefasPendentes,
      icon: <AssignmentIcon color="primary" />,
      color: 'primary.main',
    },
  ]

  return (
    <Stack spacing={2}>
      <Typography variant="h6">{ts('bpe.title')}</Typography>

      {/* KPIs */}
      <Grid container spacing={1.5}>
        {kpis.map((kpi) => (
          <Grid key={kpi.label} size={{ xs: 6, md: 4, lg: 2 }}>
            <Paper variant="outlined" sx={{ p: 1.5 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                {kpi.icon}
                <Box>
                  <Typography variant="h5" sx={{ color: kpi.color, fontWeight: 700 }}>
                    {kpi.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2, display: 'block' }}>
                    {kpi.label}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Aprovações pendentes */}
      {metrics.aguardandoAprovacao.length > 0 && (
        <Box>
          <Typography variant="subtitle2" color="warning.main" sx={{ mb: 0.5 }}>
            {ts('bpe.dashboard.aguardandoAprovacao')}
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ py: 0.5 }}>{ts('bpe.dashboard.codigo')}</TableCell>
                <TableCell sx={{ py: 0.5 }}>{ts('bpe.dashboard.tipo')}</TableCell>
                <TableCell sx={{ py: 0.5 }}>{ts('bpe.solicitadoEm')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {metrics.aguardandoAprovacao.slice(0, 6).map((item) => (
                <TableRow key={item.id}>
                  <TableCell sx={{ py: 0.5 }}>
                    <Typography variant="caption">{item.codigoOficial}</Typography>
                  </TableCell>
                  <TableCell sx={{ py: 0.5 }}>
                    <Chip
                      label={ts(`bpe.aprovacaoTipo.${item.tipo}`)}
                      size="small"
                      variant="outlined"
                      color="warning"
                    />
                  </TableCell>
                  <TableCell sx={{ py: 0.5 }}>
                    <Typography variant="caption">
                      {new Date(item.solicitadoEm).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {/* SLA vencido */}
      {metrics.slaVencido.length > 0 && (
        <Box>
          <Typography variant="subtitle2" color="error" sx={{ mb: 0.5 }}>
            {ts('bpe.dashboard.slaVencido')}
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
            {metrics.slaVencido.slice(0, 5).map((item) => (
              <Chip
                key={item.projetoId}
                label={`${item.codigo} +${item.diasAtraso}d`}
                size="small"
                color="error"
                variant="outlined"
              />
            ))}
          </Stack>
        </Box>
      )}

      {/* Sem movimentação */}
      {metrics.semMovimentacao.length > 0 && (
        <Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
            {ts('bpe.dashboard.semMovimentacao')}
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
            {metrics.semMovimentacao.slice(0, 5).map((item) => (
              <Chip
                key={item.projetoId}
                label={`${item.codigo} (${item.diasParado}d)`}
                size="small"
                variant="outlined"
              />
            ))}
          </Stack>
        </Box>
      )}

      {metrics.aguardandoAprovacao.length === 0 &&
        metrics.slaVencido.length === 0 &&
        metrics.bloqueados.length === 0 && (
          <Typography color="text.secondary">{ts('bpe.dashboard.semItens')}</Typography>
        )}
    </Stack>
  )
}
