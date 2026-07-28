import type { ProjetoEntity } from '@/shared/types/entities'
import type { WorkflowActor } from '@/shared/workflow/WorkflowModel'
import { BaseRepository } from '@/shared/repositories/BaseRepository'
import { BaseService } from '@/shared/services/base/BaseService'
import { WorkflowService } from '@/shared/workflow/WorkflowService'
import type { WorkflowStatus, WorkflowTypeCode } from '@/shared/workflow/WorkflowTypes'

class ProjetoServiceImpl extends BaseService<ProjetoEntity> {
	async transitionWorkflowStatus(
		projetoId: string,
		actor: WorkflowActor,
		tipo: WorkflowTypeCode,
		status: WorkflowStatus,
		observacao?: string
	) {
		return WorkflowService.transitionStatus({
			projetoId,
			actor,
			tipo,
			toStatus: status,
			observacao,
		})
	}

	async approveWorkflow(projetoId: string, actor: WorkflowActor, tipo: WorkflowTypeCode, observacao?: string) {
		return WorkflowService.processManagerApproval({
			projetoId,
			actor,
			tipo,
			decision: 'APROVAR',
			observacao,
		})
	}

	async requestWorkflowRevision(
		projetoId: string,
		actor: WorkflowActor,
		tipo: WorkflowTypeCode,
		observacao?: string
	) {
		return WorkflowService.processManagerApproval({
			projetoId,
			actor,
			tipo,
			decision: 'SOLICITAR_REVISAO',
			observacao,
		})
	}
}

export const ProjetoService = new ProjetoServiceImpl(new BaseRepository<ProjetoEntity>('projetos'))
