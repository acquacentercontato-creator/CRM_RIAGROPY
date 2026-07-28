import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/auth/AuthContext'
import { ImotoService } from '@/modules/imoto/services/ImotoService'
import { ImotoStorageService } from '@/modules/imoto/services/ImotoStorageService'
import type {
  ImotoActor,
  ImotoLevantamento,
  ImotoLevantamentoForm,
  ImotoUploadCategory,
  ImotoUploadedFile,
} from '@/modules/imoto/types/imotoTypes'

const keys = {
  list: ['imoto', 'levantamentos'] as const,
}

const fallbackActor: ImotoActor = {
  id: 'sistema',
  name: 'sistema',
  role: 'ADMINISTRADOR',
}

export const useImotoLevantamentos = () => {
  return useQuery<ImotoLevantamento[]>({
    queryKey: keys.list,
    queryFn: () => ImotoService.list(),
  })
}

export const useImotoMutations = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const actor: ImotoActor = user
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
      mutationFn: (payload: ImotoLevantamentoForm) => ImotoService.create(payload, actor),
      onSuccess: refresh,
    }),
    update: useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: ImotoLevantamentoForm }) =>
        ImotoService.update(id, payload, actor),
      onSuccess: refresh,
    }),
    remove: useMutation({
      mutationFn: (id: string) => ImotoService.remove(id),
      onSuccess: refresh,
    }),
    sendToEngineering: useMutation({
      mutationFn: (id: string) => ImotoService.sendToEngineering(id, actor),
      onSuccess: refresh,
    }),
    uploadMedia: useMutation({
      mutationFn: ({
        files,
        category,
        segment,
      }: {
        files: File[]
        category: ImotoUploadCategory
        segment: ImotoLevantamento['segmento']
      }) => ImotoStorageService.uploadMediaFiles(files, category, segment),
    }),
  }
}

export const useImotoHelpers = () => {
  const appendUploadedMedia = (current: ImotoUploadedFile[], incoming: ImotoUploadedFile[]) => {
    return [...incoming, ...current]
  }

  return {
    appendUploadedMedia,
  }
}
