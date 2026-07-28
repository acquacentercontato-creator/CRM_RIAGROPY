import { BaseRepository } from '@/shared/repositories/BaseRepository'
import { OBRAS_COLLECTIONS } from '@/modules/obras/models/obrasModels'
import type { Obra } from '@/modules/obras/types/obrasTypes'

export class ObrasRepository extends BaseRepository<Obra> {
  constructor() {
    super(OBRAS_COLLECTIONS.obras)
  }
}

export const obrasRepository = new ObrasRepository()
