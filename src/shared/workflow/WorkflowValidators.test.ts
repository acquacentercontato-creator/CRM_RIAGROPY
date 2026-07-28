import { describe, expect, it } from 'vitest'
import { WORKFLOW_STATUS } from '@/shared/workflow/WorkflowTypes'
import {
  validateManagerApproval,
  validateWorkflowFlow,
  validateWorkflowTransition,
} from '@/shared/workflow/WorkflowValidators'

describe('WorkflowValidators', () => {
  it('valida fluxo sem duplicidade', () => {
    const result = validateWorkflowFlow([
      WORKFLOW_STATUS.CLIENTE,
      WORKFLOW_STATUS.VISITA,
      WORKFLOW_STATUS.LEVANTAMENTO,
    ])

    expect(result.ok).toBe(true)
  })

  it('reprova fluxo com etapas duplicadas', () => {
    const result = validateWorkflowFlow([
      WORKFLOW_STATUS.CLIENTE,
      WORKFLOW_STATUS.CLIENTE,
    ])

    expect(result.ok).toBe(false)
    expect(result.errors[0]).toContain('duplicadas')
  })

  it('valida transicao sequencial', () => {
    const result = validateWorkflowTransition(WORKFLOW_STATUS.CLIENTE, WORKFLOW_STATUS.VISITA)

    expect(result.ok).toBe(true)
  })

  it('bloqueia aprovacao por perfil sem permissao', () => {
    const result = validateManagerApproval('COMERCIAL', 'APROVAR')

    expect(result.ok).toBe(false)
    expect(result.reason).toContain('Apenas gerente')
  })
})
