/**
 * Widget de métricas do motor de automação CRM para o Dashboard
 */

import {
  Box,
  Chip,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import AssignmentIcon from '@mui/icons-material/Assignment'
import BlockIcon from '@mui/icons-material/Block'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import TimerIcon from '@mui/icons-material/Timer'
import WarningIcon from '@mui/icons-material/Warning'
import type { AutomationMetrics } from '@/shared/crm-automation/WorkflowEngine'
import type { AutomationTask } from '@/shared/crm-automation/WorkflowExecutor'
import { CRM_AUTOMATION_RULES } from '@/shared/crm-automation/WorkflowRules'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

interface AutomationMetricsWidgetProps {
  metrics: AutomationMetrics
  tasks: AutomationTask[]
}

export const AutomationMetricsWidget = ({ metrics, tasks }: AutomationMetricsWidgetProps) => {
  const ts = useTranslationService()

  const total = metrics.fluxosAtivos + metrics.fluxosConcluidos + metrics.fluxosBloqueados
  const progressAtivos = total > 0 ? (metrics.fluxosAtivos / total) * 100 : 0
  const progressConcluidos = total > 0 ? (metrics.fluxosConcluidos / total) * 100 : 0

  const kpis = [
    { label: ts('automation.fluxosAtivos'), value: metrics.fluxosAtivos, icon: <PlayArrowIcon color="primary" />, color: 'primary.main' },
    { label: ts('automation.fluxosBloqueados'), value: metrics.fluxosBloqueados, icon: <BlockIcon color="error" />, color: 'error.main' },
    { label: ts('automation.fluxosConcluidos'), value: metrics.fluxosConcluidos, icon: <CheckCircleIcon color="success" />, color: 'success.main' },
    { label: ts('automation.slaVencidos'), value: metrics.slaVencidos, icon: <WarningIcon color="warning" />, color: 'warning.main' },
    { label: ts('automation.tasksPendentes'), value: metrics.tasksPendentes, icon: <AssignmentIcon color="info" />, color: 'info.main' },
    { label: ts('automation.tempoMedio'), value: `${metrics.tempoMedioHoras.toFixed(0)}h`, icon: <TimerIcon color="secondary" />, color: 'secondary.main' },
  ]

  const tasksPendentes = tasks.filter((t) => t.status === 'PENDENTE').slice(0, 5)

  return (
    <Stack spacing={2}>
      <Typography variant="h6">{ts('automation.title')}</Typography>

      {/* KPIs compactos */}
      <Grid container spacing={1}>
        {kpis.map((kpi) => (
          <Grid key={kpi.label} size={{ xs: 6, sm: 4, md: 2 }}>
            <Paper variant="outlined" sx={{ p: 1 }}>
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                {kpi.icon}
                <Box>
                  <Typography variant="h6" sx={{ color: kpi.color, fontWeight: 700, lineHeight: 1 }}>
                    {kpi.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.1, display: 'block', fontSize: 10 }}>
                    {kpi.label}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Progress bars */}
      {total > 0 && (
        <Stack spacing={0.5}>
          <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography variant="caption" color="primary">{ts('automation.fluxosAtivos')}: {progressAtivos.toFixed(0)}%</Typography>
            <Typography variant="caption" color="success.main">{ts('automation.fluxosConcluidos')}: {progressConcluidos.toFixed(0)}%</Typography>
          </Stack>
          <LinearProgress variant="determinate" value={progressAtivos} color="primary" sx={{ height: 6, borderRadius: 3 }} />
          <LinearProgress variant="determinate" value={progressConcluidos} color="success" sx={{ height: 6, borderRadius: 3 }} />
        </Stack>
      )}

      {/* Regras ativas */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{ts('automation.dashboard.regras')}: {CRM_AUTOMATION_RULES.filter((r) => r.ativo).length}</Typography>
        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
          {CRM_AUTOMATION_RULES.filter((r) => r.ativo).map((rule) => (
            <Tooltip key={rule.id} title={rule.descricao}>
              <Chip label={rule.nome} size="small" variant="outlined" sx={{ fontSize: 9 }} />
            </Tooltip>
          ))}
        </Stack>
      </Box>

      {/* Tarefas pendentes */}
      {tasksPendentes.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{ts('automation.tasks.title')}</Typography>
          <List disablePadding dense>
            {tasksPendentes.map((task) => (
              <ListItem key={task.id} disablePadding>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <AssignmentIcon fontSize="small" color="warning" />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography variant="caption">{ts(task.titulo)}</Typography>}
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {task.clienteNome ?? task.entityId} · {task.responsavelRole}
                      {task.prazo && ` · ${new Date(task.prazo).toLocaleDateString()}`}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {total === 0 && (
        <Typography color="text.secondary">{ts('automation.semItens')}</Typography>
      )}
    </Stack>
  )
}
