import { z } from 'zod'
import { workflowEngine } from '@/shared/workflow/WorkflowEngine'
import {
  WORKFLOW_STATUS,
  WORKFLOW_STATUS_VALUES,
  type WorkflowStatus,
} from '@/shared/workflow/WorkflowTypes'

const workflowStatusSchema = z.enum(WORKFLOW_STATUS_VALUES as [WorkflowStatus, ...WorkflowStatus[]])

const workflowFlowSchema = z
  .array(workflowStatusSchema)
  .min(1)
  .refine((flow) => new Set(flow).size === flow.length, 'Fluxo contem etapas duplicadas')

export const workflowCreateSchema = z.object({
  projetoId: z.string().min(1),
  codigoOficial: z.string().min(1),
  tipo: z.string().min(1),
  flow: workflowFlowSchema,
  statusInicial: workflowStatusSchema,
})

export const workflowTransitionSchema = z.object({
  fromStatus: workflowStatusSchema,
  toStatus: workflowStatusSchema,
})

export const validateWorkflowFlow = (flow: WorkflowStatus[]) => {
  const parsed = workflowFlowSchema.safeParse(flow)
  return {
    ok: parsed.success,
    errors: parsed.success ? [] : parsed.error.issues.map((item) => item.message),
  }
}

export const validateWorkflowTransition = (fromStatus: WorkflowStatus, toStatus: WorkflowStatus) => {
  const parsed = workflowTransitionSchema.safeParse({ fromStatus, toStatus })
  if (!parsed.success) {
    return {
      ok: false,
      reason: parsed.error.issues[0]?.message ?? 'Transicao invalida',
    }
  }

  if (!workflowEngine.canTransition(fromStatus, toStatus)) {
    return {
      ok: false,
      reason: 'Transicao fora do fluxo configurado',
    }
  }

  return {
    ok: true,
    reason: '',
  }
}

export const validateManagerApproval = (role: string, decision: 'APROVAR' | 'SOLICITAR_REVISAO') => {
  const isManager = role === 'GERENTE' || role === 'ADMINISTRADOR'

  if (!isManager) {
    return {
      ok: false,
      reason: 'Apenas gerente pode aprovar ou solicitar revisao',
    }
  }

  if (decision === 'SOLICITAR_REVISAO') {
    return {
      ok: true,
      reason: '',
      targetStatus: WORKFLOW_STATUS.EM_PROJETO,
    }
  }

  return {
    ok: true,
    reason: '',
    targetStatus: null,
  }
}
