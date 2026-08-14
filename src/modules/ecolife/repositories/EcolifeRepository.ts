import { BaseRepository } from '@/shared/repositories/BaseRepository'
import { ECOLIFE_COLLECTIONS } from '@/modules/ecolife/models/ecolifeModels'
import type { EcolifeDiagnostic, EcolifeProduct } from '@/modules/ecolife/types/ecolifeTypes'

const repositories: Record<EcolifeProduct, BaseRepository<EcolifeDiagnostic>> = {
  SWINE: new BaseRepository(ECOLIFE_COLLECTIONS.SWINE),
  POULTRY: new BaseRepository(ECOLIFE_COLLECTIONS.POULTRY),
}

export const getEcolifeRepository = (product: EcolifeProduct) => repositories[product]
