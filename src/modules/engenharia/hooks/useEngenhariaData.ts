import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/auth/AuthContext'
import { EngenhariaService } from '@/modules/engenharia/services/EngenhariaService'
import type {
  EngenhariaActor,
  EngenhariaProject,
  EngenhariaProjectForm,
  EngenhariaStatus,
  EngenhariaUploadCategory,
} from '@/modules/engenharia/types/engenhariaTypes'
import { dashboardFromProjects } from '@/modules/engenharia/utils/engenhariaUtils'

const keys = {
  list: ['engenharia', 'projetos'] as const,
}

const fallbackActor: EngenhariaActor = {
  id: 'sistema',
  name: 'sistema',
  role: 'ADMINISTRADOR',
}

export const useEngenhariaProjetos = () => {
  return useQuery<EngenhariaProject[]>({
    queryKey: keys.list,
    queryFn: () => EngenhariaService.list(),
  })
}

export const useEngenhariaDashboard = () => {
  const query = useEngenhariaProjetos()
  const data = dashboardFromProjects(query.data ?? [])

  return {
    ...query,
    dashboard: data,
  }
}

export const useEngenhariaMutations = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const actor: EngenhariaActor = user
    ? {
        id: user.id,
        name: user.name,
        role: user.role,
      }
    : fallbackActor

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: keys.list })
  }

  return {
    create: useMutation({
      mutationFn: (payload: EngenhariaProjectForm) => EngenhariaService.create(payload, actor),
      onSuccess: refresh,
    }),
    update: useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: EngenhariaProjectForm }) =>
        EngenhariaService.update(id, payload, actor),
      onSuccess: refresh,
    }),
    remove: useMutation({
      mutationFn: (id: string) => EngenhariaService.remove(id),
      onSuccess: refresh,
    }),
    changeStatus: useMutation({
      mutationFn: ({ id, status, observation }: { id: string; status: EngenhariaStatus; observation?: string }) =>
        EngenhariaService.changeStatus(id, status, actor, observation),
      onSuccess: refresh,
    }),
    createRevision: useMutation({
      mutationFn: ({ id, motivo }: { id: string; motivo: string }) =>
        EngenhariaService.createRevision(id, actor, motivo),
      onSuccess: refresh,
    }),
    saveMemorial: useMutation({
      mutationFn: ({ id, memorial }: { id: string; memorial: string }) =>
        EngenhariaService.saveMemorial(id, memorial, actor),
      onSuccess: refresh,
    }),
    processManagerApproval: useMutation({
      mutationFn: ({
        id,
        decision,
        observacao,
      }: {
        id: string
        decision: 'APROVAR' | 'SOLICITAR_REVISAO'
        observacao: string
      }) => EngenhariaService.processManagerApproval(id, actor, decision, observacao),
      onSuccess: refresh,
    }),
    sendToBudget: useMutation({
      mutationFn: (id: string) => EngenhariaService.sendToBudget(id, actor),
      onSuccess: refresh,
    }),
    uploadFiles: useMutation({
      mutationFn: ({ id, category, files }: { id: string; category: EngenhariaUploadCategory; files: File[] }) =>
        EngenhariaService.uploadFiles(id, category, files, actor),
      onSuccess: refresh,
    }),
  }
}
