import { describe, expect, it } from 'vitest'
import { WorkflowEngine } from '@/shared/workflow/WorkflowEngine'
import { WORKFLOW_STATUS } from '@/shared/workflow/WorkflowTypes'

describe('WorkflowEngine', () => {
  it('retorna proxima etapa em fluxo sequencial', () => {
    const engine = new WorkflowEngine([
      WORKFLOW_STATUS.CLIENTE,
      WORKFLOW_STATUS.VISITA,
      WORKFLOW_STATUS.LEVANTAMENTO,
    ])

    expect(engine.getNextStep(WORKFLOW_STATUS.CLIENTE)).toBe(WORKFLOW_STATUS.VISITA)
    expect(engine.getNextStep(WORKFLOW_STATUS.LEVANTAMENTO)).toBeNull()
  })

  it('permite cancelamento em qualquer etapa', () => {
    const engine = new WorkflowEngine([
      WORKFLOW_STATUS.CLIENTE,
      WORKFLOW_STATUS.VISITA,
      WORKFLOW_STATUS.LEVANTAMENTO,
    ])

    expect(engine.canTransition(WORKFLOW_STATUS.CLIENTE, WORKFLOW_STATUS.CANCELADO)).toBe(true)
  })
})
