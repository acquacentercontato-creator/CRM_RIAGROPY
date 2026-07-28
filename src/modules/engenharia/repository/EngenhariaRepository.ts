import { BaseRepository } from '@/shared/repositories/BaseRepository'
import { ENGENHARIA_COLLECTIONS } from '@/modules/engenharia/models/engenhariaModels'
import type { EngenhariaProject } from '@/modules/engenharia/types/engenhariaTypes'

export class EngenhariaRepository extends BaseRepository<EngenhariaProject> {
  constructor() {
    super(ENGENHARIA_COLLECTIONS.projetos)
  }
}

export const engenhariaRepository = new EngenhariaRepository()
