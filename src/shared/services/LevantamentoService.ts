import type { LevantamentoEntity } from '@/shared/types/entities'
import { BaseRepository } from '@/shared/repositories/BaseRepository'
import { BaseService } from '@/shared/services/base/BaseService'

class LevantamentoServiceImpl extends BaseService<LevantamentoEntity> {}

export const LevantamentoService = new LevantamentoServiceImpl(
  new BaseRepository<LevantamentoEntity>('levantamentos')
)
