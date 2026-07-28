import { describe, expect, it } from 'vitest'
import { BaseRepository } from '@/shared/repositories/BaseRepository'

type MockEntity = {
  id: string
  createdAt: string
}

describe('BaseRepository', () => {
  it('findAll retorna lista vazia quando firestore indisponivel', async () => {
    const repository = new BaseRepository<MockEntity>('mock_collection')

    const rows = await repository.findAll()

    expect(rows).toEqual([])
  })

  it('create falha quando firestore indisponivel', async () => {
    const repository = new BaseRepository<MockEntity>('mock_collection')

    await expect(
      repository.create({
        createdAt: new Date().toISOString(),
      })
    ).rejects.toThrow('Firestore indisponivel para criacao')
  })
})
