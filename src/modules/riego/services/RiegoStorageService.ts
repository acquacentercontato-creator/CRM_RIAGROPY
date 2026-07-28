import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { firebaseStorage } from '@/firebase/app'
import { RIEGO_MEDIA_FOLDER } from '@/modules/riego/models/riegoModels'
import type { RiegoMediaItem, RiegoMediaType } from '@/modules/riego/types/riegoTypes'
import { makeId, nowIso } from '@/modules/riego/utils/riegoUtils'
import { assertUploadPolicy } from '@/shared/utils/uploadPolicy'

const mapUploadCategory = (type: RiegoMediaType) => {
  if (type === 'FOTO') return 'FOTO' as const
  if (type === 'VIDEO') return 'VIDEO' as const
  return 'OUTRO' as const
}

/**
 * Responsavel por upload de midias do modulo RIEGO.
 */
export const RiegoStorageService = {
  async uploadMediaFiles(files: File[], type: RiegoMediaType): Promise<RiegoMediaItem[]> {
    const uploads = await Promise.all(
      files.map(async (file) => {
        const { safeName } = assertUploadPolicy(mapUploadCategory(type), file)

        if (!firebaseStorage) {
          return {
            id: makeId(),
            type,
            name: safeName,
            url: URL.createObjectURL(file),
            createdAt: nowIso(),
          }
        }

        const path = `riego/${RIEGO_MEDIA_FOLDER[type]}/${Date.now()}-${safeName}`
        const storageRef = ref(firebaseStorage, path)
        await uploadBytes(storageRef, file)
        const url = await getDownloadURL(storageRef)

        return {
          id: makeId(),
          type,
          name: safeName,
          url,
          createdAt: nowIso(),
        }
      })
    )

    return uploads
  },
}
