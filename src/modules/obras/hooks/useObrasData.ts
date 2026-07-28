import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/auth/AuthContext'
import { ObrasService } from '@/modules/obras/services/ObrasService'
import type { Obra, ObraActor, ObraForm, ObraStatus, ObrasUploadCategory } from '@/modules/obras/types/obrasTypes'
import { buildDashboard } from '@/modules/obras/utils/obrasUtils'

const keys = {
  list: ['obras', 'list'] as const,
}

const fallbackActor: ObraActor = {
  id: 'sistema',
  name: 'sistema',
  role: 'ADMINISTRADOR',
}

export const useObras = () => {
  return useQuery<Obra[]>({
    queryKey: keys.list,
    queryFn: () => ObrasService.list(),
  })
}

export const useObrasDashboard = () => {
  const query = useObras()

  return {
    ...query,
    dashboard: buildDashboard(query.data ?? []),
  }
}

export const useObrasMutations = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const actor: ObraActor = user
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
      mutationFn: (payload: ObraForm) => ObrasService.create(payload, actor),
      onSuccess: refresh,
    }),
    update: useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: ObraForm }) => ObrasService.update(id, payload, actor),
      onSuccess: refresh,
    }),
    remove: useMutation({
      mutationFn: (id: string) => ObrasService.remove(id),
      onSuccess: refresh,
    }),
    changeStatus: useMutation({
      mutationFn: ({ id, status, observacao }: { id: string; status: ObraStatus; observacao?: string }) =>
        ObrasService.changeStatus(id, status, actor, observacao),
      onSuccess: refresh,
    }),
    uploadFiles: useMutation({
      mutationFn: ({ id, category, files }: { id: string; category: ObrasUploadCategory; files: File[] }) =>
        ObrasService.uploadFiles(id, category, files, actor),
      onSuccess: refresh,
    }),
  }
}
