import type { BaseEntity } from '@/shared/models/base'
import { BaseRepository } from '@/shared/repositories/BaseRepository'

export class BaseService<T extends BaseEntity> {
  private readonly repository: BaseRepository<T>

  constructor(repository: BaseRepository<T>) {
    this.repository = repository
  }

  async list(): Promise<T[]> {
    return this.repository.findAll()
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const now = new Date().toISOString()
    const payload = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    } as T

    const withoutId = { ...payload }
    delete (withoutId as { id?: string }).id
    return this.repository.create(withoutId)
  }

  async update(id: string, data: Partial<Omit<T, 'id'>>): Promise<void> {
    await this.repository.update(id, {
      ...data,
      updatedAt: new Date().toISOString(),
    })
  }

  async remove(id: string): Promise<void> {
    await this.repository.remove(id)
  }
}
