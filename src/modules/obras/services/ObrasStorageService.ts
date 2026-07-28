import { ArquivoService } from '@/shared/services/ArquivoService'
import { NotificationService } from '@/shared/services/NotificationService'
import { OBRAS_MEDIA_BUCKET, OBRAS_MEDIA_FOLDER } from '@/modules/obras/models/obrasModels'
import type { ObraFiles, ObrasUploadCategory, ObrasUploadedFile } from '@/modules/obras/types/obrasTypes'

const fallbackUpload = (file: File, category: ObrasUploadCategory): ObrasUploadedFile => {
  return {
    id: crypto.randomUUID(),
    category,
    name: file.name,
    mimeType: file.type,
    size: file.size,
    url: URL.createObjectURL(file),
    createdAt: new Date().toISOString(),
  }
}

export const ObrasStorageService = {
  async upload(
    files: File[],
    category: ObrasUploadCategory,
    obraCode: string
  ): Promise<{ bucket: keyof ObraFiles; files: ObrasUploadedFile[] }> {
    const uploaded = await Promise.all(
      files.map(async (file) => {
        try {
          const output = await ArquivoService.upload(
            category,
            file,
            `obras/${obraCode}/${OBRAS_MEDIA_FOLDER[category]}`
          )

          return {
            ...output,
            category,
          }
        } catch {
          return fallbackUpload(file, category)
        }
      })
    )

    NotificationService.create(
      'info',
      'Upload Obras',
      `${uploaded.length} arquivo(s) enviados para ${OBRAS_MEDIA_FOLDER[category]}.`
    )

    return {
      bucket: OBRAS_MEDIA_BUCKET[category],
      files: uploaded,
    }
  },
}
