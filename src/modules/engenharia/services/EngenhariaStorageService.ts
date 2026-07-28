import { ArquivoService } from '@/shared/services/ArquivoService'
import { NotificationService } from '@/shared/services/NotificationService'
import {
  ENGENHARIA_MEDIA_BUCKET,
  ENGENHARIA_MEDIA_FOLDER,
} from '@/modules/engenharia/models/engenhariaModels'
import type {
  EngenhariaProjectFiles,
  EngenhariaUploadCategory,
  EngenhariaUploadedFile,
} from '@/modules/engenharia/types/engenhariaTypes'

const fallbackFile = (file: File, category: EngenhariaUploadCategory): EngenhariaUploadedFile => {
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

export const EngenhariaStorageService = {
  async upload(
    files: File[],
    category: EngenhariaUploadCategory,
    projectCode: string
  ): Promise<{ bucket: keyof EngenhariaProjectFiles; files: EngenhariaUploadedFile[] }> {
    const uploaded = await Promise.all(
      files.map(async (file) => {
        try {
          const result = await ArquivoService.upload(
            category,
            file,
            `engenharia/${projectCode}/${ENGENHARIA_MEDIA_FOLDER[category]}`
          )

          return {
            ...result,
            category,
          }
        } catch {
          return fallbackFile(file, category)
        }
      })
    )

    NotificationService.create(
      'info',
      'Upload Engenharia',
      `${uploaded.length} arquivo(s) enviados em ${ENGENHARIA_MEDIA_FOLDER[category]}.`
    )

    return {
      bucket: ENGENHARIA_MEDIA_BUCKET[category],
      files: uploaded,
    }
  },
}
