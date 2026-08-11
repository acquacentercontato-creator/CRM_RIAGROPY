/**
 * Hook para gerenciar o estado do pipeline para um projeto
 */

import { useCallback, useState } from 'react'
import { PIPELINE_STEPS } from '@/shared/workflow/pipeline/WorkflowPipelineDefinition'
import { WorkflowPipelineService } from '@/shared/workflow/pipeline/WorkflowPipelineService'
import type { PipelineProjectState } from '@/shared/workflow/pipeline/WorkflowPipelineTypes'

export const useWorkflowPipeline = (projetoId: string, codigoOficial: string, clienteNome: string) => {
  const [state, setState] = useState<PipelineProjectState>(() =>
    WorkflowPipelineService.initPipeline({ projetoId, codigoOficial, clienteNome })
  )

  const stepsStatus = WorkflowPipelineService.getStepsStatus(projetoId)

  const avancar = useCallback(
    (targetStepId: string) => {
      const validacao = WorkflowPipelineService.validarTransicao(projetoId, targetStepId)
      if (!validacao.ok) return validacao
      const updated = WorkflowPipelineService.getState(projetoId)
      if (updated) setState(updated)
      return validacao
    },
    [projetoId]
  )

  const updateChecklist = useCallback(
    (stepId: string, itemId: string, done: boolean) => {
      WorkflowPipelineService.updateChecklistItem(projetoId, stepId, itemId, done)
      const updated = WorkflowPipelineService.getState(projetoId)
      if (updated) setState(updated)
    },
    [projetoId]
  )

  const etapaAtual = PIPELINE_STEPS.find((s) => s.id === state.etapaAtualId)

  return { state, stepsStatus, avancar, updateChecklist, etapaAtual }
}
