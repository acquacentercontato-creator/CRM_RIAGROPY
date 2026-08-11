/**
 * Painel visual do pipeline de 17 etapas para um projeto específico
 */

import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Collapse,
  Divider,
  FormControlLabel,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import LockIcon from '@mui/icons-material/Lock'
import PauseCircleIcon from '@mui/icons-material/PauseCircle'
import PlayCircleIcon from '@mui/icons-material/PlayCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import WarningIcon from '@mui/icons-material/Warning'
import { useState } from 'react'
import { PIPELINE_STEPS } from '@/shared/workflow/pipeline/WorkflowPipelineDefinition'
import type { PipelineStepState, PipelineStepStatus } from '@/shared/workflow/pipeline/WorkflowPipelineTypes'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

interface WorkflowPipelinePanelProps {
  projetoId: string
  stepsStatus: Array<{
    step: (typeof PIPELINE_STEPS)[number]
    state: PipelineStepState
  }>
  onAvancar?: (stepId: string) => void
  onChecklistChange?: (stepId: string, itemId: string, done: boolean) => void
  readonly?: boolean
}

const STATUS_COLORS: Record<PipelineStepStatus, string> = {
  PENDENTE: 'default',
  EM_ANDAMENTO: 'primary',
  AGUARDANDO: 'warning',
  BLOQUEADO: 'error',
  CONCLUIDO: 'success',
  CANCELADO: 'default',
}

const StatusIcon = ({ status }: { status: PipelineStepStatus }) => {
  switch (status) {
    case 'CONCLUIDO': return <CheckCircleIcon color="success" fontSize="small" />
    case 'EM_ANDAMENTO': return <PlayCircleIcon color="primary" fontSize="small" />
    case 'BLOQUEADO': return <LockIcon color="error" fontSize="small" />
    case 'AGUARDANDO': return <PauseCircleIcon color="warning" fontSize="small" />
    default: return <RadioButtonUncheckedIcon color="disabled" fontSize="small" />
  }
}

export const WorkflowPipelinePanel = ({
  stepsStatus,
  onAvancar,
  onChecklistChange,
  readonly = false,
}: WorkflowPipelinePanelProps) => {
  const ts = useTranslationService()
  const [expandedStep, setExpandedStep] = useState<string | null>(null)

  const currentIdx = stepsStatus.findIndex((s) => s.state.status === 'EM_ANDAMENTO')

  return (
    <Stack spacing={1}>
      <Typography variant="h6">{ts('workflow.pipeline')}</Typography>

      {stepsStatus.map(({ step, state }, idx) => {
        const isExpanded = expandedStep === step.id
        const isCurrent = state.status === 'EM_ANDAMENTO'
        const checklistPendentes = step.checklistObrigatorio
          .filter((item) => item.obrigatorio)
          .filter((item) => !state.checklistItems.find((c) => c.id === item.id)?.done)

        return (
          <Paper
            key={step.id}
            variant={isCurrent ? 'elevation' : 'outlined'}
            elevation={isCurrent ? 3 : 0}
            sx={{
              p: 1.5,
              cursor: 'pointer',
              borderLeft: isCurrent ? '4px solid' : '4px solid transparent',
              borderLeftColor: isCurrent ? 'primary.main' : 'transparent',
              opacity: state.status === 'PENDENTE' && idx > currentIdx + 1 ? 0.5 : 1,
            }}
            onClick={() => setExpandedStep(isExpanded ? null : step.id)}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Box sx={{ minWidth: 24 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  {step.ordem}
                </Typography>
              </Box>

              <StatusIcon status={state.status} />

              <Typography variant="body2" sx={{ flex: 1, fontWeight: isCurrent ? 600 : 400 }}>
                {ts(`workflow.steps.${step.id}`)}
              </Typography>

              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                {state.estaAtrasado && (
                  <Tooltip title={ts('workflow.sla.atrasado', { dias: state.diasAtraso })}>
                    <WarningIcon color="error" fontSize="small" />
                  </Tooltip>
                )}

                <Chip
                  label={ts(`workflow.status.${state.status}`)}
                  size="small"
                  color={STATUS_COLORS[state.status] as 'default' | 'primary' | 'error' | 'success' | 'warning'}
                  variant="outlined"
                />

                {state.dataLimite && (
                  <Typography variant="caption" color="text.secondary">
                    {ts('workflow.sla.label')}: {new Date(state.dataLimite).toLocaleDateString()}
                  </Typography>
                )}
              </Stack>
            </Stack>

            <Collapse in={isExpanded}>
              <Box sx={{ pt: 1.5, pl: 4 }}>
                <Divider sx={{ mb: 1 }} />

                <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={ts(`workflow.responsavel.${step.responsavel}`)}
                    size="small"
                    variant="outlined"
                  />
                  {step.slaDias > 0 && (
                    <Chip
                      label={ts('workflow.sla.dias', { dias: step.slaDias })}
                      size="small"
                      variant="outlined"
                      color={state.estaAtrasado ? 'error' : 'default'}
                    />
                  )}
                  {step.dependencias.length > 0 && (
                    <Chip
                      label={`Deps: ${step.dependencias.join(', ')}`}
                      size="small"
                      variant="outlined"
                      color="info"
                    />
                  )}
                </Stack>

                {/* Checklist */}
                {step.checklistObrigatorio.length > 0 && (
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      {ts('workflow.checklist.title')}
                    </Typography>
                    {step.checklistObrigatorio.map((item) => {
                      const checked = state.checklistItems.find((c) => c.id === item.id)?.done ?? false
                      return (
                        <FormControlLabel
                          key={item.id}
                          control={
                            <Checkbox
                              checked={checked}
                              size="small"
                              disabled={readonly || state.status !== 'EM_ANDAMENTO'}
                              onChange={(e) => onChecklistChange?.(step.id, item.id, e.target.checked)}
                            />
                          }
                          label={
                            <Typography variant="caption">
                              {ts(item.label)}
                              {item.obrigatorio && (
                                <Typography component="span" variant="caption" color="error">
                                  {' '}*
                                </Typography>
                              )}
                            </Typography>
                          }
                        />
                      )
                    })}
                  </Stack>
                )}

                {/* Bloqueio info */}
                {checklistPendentes.length > 0 && isCurrent && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    {ts('workflow.checklist.pendentes', { count: checklistPendentes.length })}
                  </Alert>
                )}

                {/* Botão avançar */}
                {isCurrent && !readonly && onAvancar && (
                  <Box sx={{ mt: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      disabled={checklistPendentes.length > 0}
                      onClick={(e) => {
                        e.stopPropagation()
                        const nextStep = PIPELINE_STEPS[idx + 1]
                        if (nextStep) onAvancar(nextStep.id)
                      }}
                    >
                      {ts('workflow.avancar')}
                    </Button>
                  </Box>
                )}
              </Box>
            </Collapse>
          </Paper>
        )
      })}
    </Stack>
  )
}
