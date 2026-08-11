/**
 * Hook para gerenciamento de anexos por entidade
 */

import { useCallback, useEffect, useState } from 'react'
import { AttachmentService } from '@/shared/attachments'
import type { AttachmentMetadata, ModuleContext } from '@/shared/attachments'

interface UseAttachmentsOptions {
  entityId: string
  moduloContext: ModuleContext
  enabled?: boolean
}

export const useAttachments = ({ entityId, moduloContext, enabled = true }: UseAttachmentsOptions) => {
  const [data, setData] = useState<AttachmentMetadata[]>([])
  const [loading, setLoading] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const reload = useCallback(() => setReloadKey((k) => k + 1), [])

  useEffect(() => {
    if (!enabled || !entityId) return

    let isMounted = true

    AttachmentService.listarPorCliente(entityId).then((result) => {
      if (isMounted) {
        setData(result.filter((a) => a.moduloContext === moduloContext))
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
    }
  }, [entityId, moduloContext, enabled, reloadKey])

  const deletar = useCallback(
    async (id: string) => {
      await AttachmentService.deletar(id)
      reload()
    },
    [reload]
  )

  const toggleFavorito = useCallback(
    async (anexo: AttachmentMetadata) => {
      if (anexo.isFavorite) {
        await AttachmentService.removerDosFavoritos(anexo.id)
      } else {
        await AttachmentService.adicionarAosFavoritos(anexo.id)
      }
      reload()
    },
    [reload]
  )

  const stats = {
    total: data.length,
    ultimoUpload: data
      .slice()
      .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))[0]?.criadoEm,
    ultimaAlteracao: data
      .slice()
      .sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm))[0]?.atualizadoEm,
  }

  return { data, loading, reload, deletar, toggleFavorito, stats }
}
