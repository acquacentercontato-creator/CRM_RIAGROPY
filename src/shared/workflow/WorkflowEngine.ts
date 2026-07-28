import type { WorkflowStatus } from '@/shared/workflow/WorkflowTypes'
import { WORKFLOW_DEFAULT_SEQUENCE, WORKFLOW_STATUS } from '@/shared/workflow/WorkflowTypes'

export class WorkflowEngine {
  private readonly sequence: WorkflowStatus[]

  constructor(sequence: WorkflowStatus[] = WORKFLOW_DEFAULT_SEQUENCE) {
    this.sequence = sequence
  }

  getSteps(): WorkflowStatus[] {
    return [...this.sequence]
  }

  getCurrentIndex(status: WorkflowStatus): number {
    return this.sequence.indexOf(status)
  }

  getNextStep(status: WorkflowStatus): WorkflowStatus | null {
    const index = this.getCurrentIndex(status)
    if (index < 0) return null
    return this.sequence[index + 1] ?? null
  }

  canTransition(fromStatus: WorkflowStatus, toStatus: WorkflowStatus): boolean {
    if (toStatus === WORKFLOW_STATUS.CANCELADO) return true
    const fromIndex = this.getCurrentIndex(fromStatus)
    const toIndex = this.getCurrentIndex(toStatus)
    if (fromIndex < 0 || toIndex < 0) return false
    return toIndex === fromIndex + 1
  }
}

export const workflowEngine = new WorkflowEngine()
