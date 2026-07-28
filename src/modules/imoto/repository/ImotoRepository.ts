import { BaseRepository } from '@/shared/repositories/BaseRepository'
import { IMOTO_COLLECTIONS } from '@/modules/imoto/models/imotoModels'
import type { ImotoLevantamento } from '@/modules/imoto/types/imotoTypes'

export class ImotoRepository extends BaseRepository<ImotoLevantamento> {
  constructor() {
    super(IMOTO_COLLECTIONS.levantamentos)
  }
}

export const imotoRepository = new ImotoRepository()
