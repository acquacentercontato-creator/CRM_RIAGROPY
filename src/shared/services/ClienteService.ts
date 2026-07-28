import type { ClienteEntity } from '@/shared/types/entities'
import { BaseRepository } from '@/shared/repositories/BaseRepository'
import { BaseService } from '@/shared/services/base/BaseService'

class ClienteServiceImpl extends BaseService<ClienteEntity> {}

export const ClienteService = new ClienteServiceImpl(new BaseRepository<ClienteEntity>('clientes'))
