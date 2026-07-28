import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import type { UploadFileCategory, UploadedFile } from '@/shared/types/core'
import { firebaseStorage } from '@/firebase/app'
import type { ArquivoEntity } from '@/shared/types/entities'
import { BaseRepository } from '@/shared/repositories/BaseRepository'
import { BaseService } from '@/shared/services/base/BaseService'
import { assertUploadPolicy } from '@/shared/utils/uploadPolicy'

class ArquivoServiceImpl extends BaseService<ArquivoEntity> {
  async upload(category: UploadFileCategory, file: File, folder: string): Promise<UploadedFile> {
    if (!firebaseStorage) {
      throw new Error('Storage indisponivel para upload')
    }

    const { safeName } = assertUploadPolicy(category, file)

    const path = `${folder}/${Date.now()}-${safeName}`
    const fileRef = ref(firebaseStorage, path)
    await uploadBytes(fileRef, file)
    const url = await getDownloadURL(fileRef)

    return {
      id: path,
      category,
      name: file.name,
      mimeType: file.type,
      size: file.size,
      url,
      createdAt: new Date().toISOString(),
    }
  }
}

export const ArquivoService = new ArquivoServiceImpl(new BaseRepository<ArquivoEntity>('arquivos'))
