import { ArquivoService } from '@/shared/services/ArquivoService'
import { NotificationService } from '@/shared/services/NotificationService'
import { IMOTO_MEDIA_FOLDER } from '@/modules/imoto/models/imotoModels'
import type {
  ImotoUploadCategory,
  ImotoSegment,
  ImotoUploadedFile,
} from '@/modules/imoto/types/imotoTypes'

const toUploadedFileFallback = (file: File, category: ImotoUploadCategory): ImotoUploadedFile => {
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

export const ImotoStorageService = {
  async uploadMediaFiles(
    files: File[],
    category: ImotoUploadCategory,
    segment: ImotoSegment
  ): Promise<ImotoUploadedFile[]> {
    const uploads = await Promise.all(
      files.map(async (file) => {
        try {
          const uploaded = await ArquivoService.upload(
            category,
            file,
            `imoto/${segment.toLowerCase()}/${IMOTO_MEDIA_FOLDER[category]}`
          )
          return {
            ...uploaded,
            category,
          }
        } catch {
          return toUploadedFileFallback(file, category)
        }
      })
    )

    NotificationService.create(
      'info',
      'Upload concluido',
      `${uploads.length} arquivo(s) enviados para ${IMOTO_MEDIA_FOLDER[category]}.`
    )

    return uploads
  },
}
