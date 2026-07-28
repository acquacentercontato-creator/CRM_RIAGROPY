import type { TimelineEvent } from '@/shared/types/core'
import type { WorkflowStatus } from '@/shared/workflow/WorkflowTypes'
import { WORKFLOW_STATUS } from '@/shared/workflow/WorkflowTypes'
import type {
  EngenhariaActor,
  EngenhariaProject,
  EngenhariaProjectForm,
  EngenhariaStatus,
} from '@/modules/engenharia/types/engenhariaTypes'

export const nowIso = () => new Date().toISOString()

export const makeId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const createTimelineEvent = (
  type: string,
  message: string,
  actor: EngenhariaActor,
  nextStatus?: string,
  previousStatus?: string | null
): TimelineEvent => ({
  id: makeId(),
  type,
  message,
  actorId: actor.id,
  actorName: actor.name,
  createdAt: nowIso(),
  action: type,
  nextStatus,
  previousStatus,
})

export const createEmptyProjectForm = (): EngenhariaProjectForm => ({
  clienteNome: '',
  titulo: '',
  tipoProjeto: 'A',
  origem: 'OUTRO',
  status: 'AGUARDANDO ENGENHARIA',
  memorialDescritivo: '',
  observacoes: '',
  plantaPdf: [],
  dwg: [],
  dxf: [],
  kmz: [],
  fotos: [],
  videos: [],
  materiais: [],
})

export const mapEngineeringStatusToWorkflow = (status: EngenhariaStatus): WorkflowStatus => {
  if (status === 'AGUARDANDO ENGENHARIA') return WORKFLOW_STATUS.AGUARDANDO_ENGENHARIA
  if (status === 'EM PROJETO') return WORKFLOW_STATUS.EM_PROJETO
  if (status === 'AGUARDANDO MEMORIAL') return WORKFLOW_STATUS.AGUARDANDO_MEMORIAL
  if (status === 'PROJETO COMPLETO') return WORKFLOW_STATUS.PROJETO_COMPLETO
  return WORKFLOW_STATUS.EM_PROJETO
}

export const dashboardFromProjects = (items: EngenhariaProject[]) => {
  const total = items.length
  const aguardando = items.filter((item) => item.status === 'AGUARDANDO ENGENHARIA').length
  const emProjeto = items.filter((item) => item.status === 'EM PROJETO').length
  const memorial = items.filter((item) => item.status === 'AGUARDANDO MEMORIAL').length
  const revisao = items.filter((item) => item.status === 'REVISAO').length
  const completo = items.filter((item) => item.status === 'PROJETO COMPLETO').length

  return {
    total,
    aguardando,
    emProjeto,
    memorial,
    revisao,
    completo,
  }
}
