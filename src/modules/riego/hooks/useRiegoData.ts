import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/auth/AuthContext'
import { RiegoService } from '@/modules/riego/services/RiegoService'
import { RiegoStorageService } from '@/modules/riego/services/RiegoStorageService'
import type {
  RiegoLevantamento,
  RiegoLevantamentoForm,
  RiegoMediaItem,
  RiegoMediaType,
} from '@/modules/riego/types/riegoTypes'

const keys = {
  list: ['riego', 'levantamentos'] as const,
}

export const useRiegoLevantamentos = () => {
  return useQuery<RiegoLevantamento[]>({
    queryKey: keys.list,
    queryFn: () => RiegoService.list(),
  })
}

export const useRiegoMutations = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const actor = user?.name || user?.email || 'sistema'

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: keys.list })
  }

  return {
    create: useMutation({
      mutationFn: (payload: RiegoLevantamentoForm) => RiegoService.create(payload, actor),
      onSuccess: refresh,
    }),
    update: useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: RiegoLevantamentoForm }) =>
        RiegoService.update(id, payload, actor),
      onSuccess: refresh,
    }),
    remove: useMutation({
      mutationFn: (id: string) => RiegoService.remove(id),
      onSuccess: refresh,
    }),
    sendToEngineering: useMutation({
      mutationFn: (id: string) => RiegoService.sendToEngineering(id, actor),
      onSuccess: refresh,
    }),
    uploadMedia: useMutation({
      mutationFn: ({ files, type }: { files: File[]; type: RiegoMediaType }) =>
        RiegoStorageService.uploadMediaFiles(files, type),
    }),
  }
}

export const useRiegoHelpers = () => {
  const appendUploadedMedia = (current: RiegoMediaItem[], incoming: RiegoMediaItem[]) => {
    return [...incoming, ...current]
  }

  return {
    appendUploadedMedia,
  }
}
