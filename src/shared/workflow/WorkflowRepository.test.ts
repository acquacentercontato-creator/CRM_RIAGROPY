import { describe, expect, it } from 'vitest'
import { WorkflowRepository } from '@/shared/workflow/WorkflowRepository'
import { WORKFLOW_STATUS } from '@/shared/workflow/WorkflowTypes'

describe('WorkflowRepository local fallback', () => {
  it('salva e consulta workflow por projeto', async () => {
    const repository = new WorkflowRepository()

    const model = {
      id: 'wf-1',
      projetoId: 'projeto-1',
      codigoOficial: 'AAA0001.1',
      tipo: 'A' as const,
      versao: 1,
      status: WORKFLOW_STATUS.CLIENTE,
      flow: [WORKFLOW_STATUS.CLIENTE, WORKFLOW_STATUS.VISITA],
      timeline: [],
      aprovacoes: [],
      etapas: {},
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    }

    await repository.save(model)

    const found = await repository.getByProjetoId('projeto-1')

    expect(found?.id).toBe('wf-1')
    expect(found?.codigoOficial).toBe('AAA0001.1')
  })

  it('salva e le configuracao de fluxo local', async () => {
    const repository = new WorkflowRepository()

    await repository.saveFlowConfig('projeto-2', [WORKFLOW_STATUS.CLIENTE, WORKFLOW_STATUS.VISITA])

    const flow = await repository.getFlowConfig('projeto-2')

    expect(flow).toEqual([WORKFLOW_STATUS.CLIENTE, WORKFLOW_STATUS.VISITA])
  })
})
