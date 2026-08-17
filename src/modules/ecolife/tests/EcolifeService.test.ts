import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EcolifeService } from '@/modules/ecolife/services/EcolifeService'

vi.mock('@/modules/ecolife/repositories/EcolifeRepository', () => ({
  getEcolifeRepository: () => ({
    findAll: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockRejectedValue(new Error('offline')),
    update: vi.fn().mockRejectedValue(new Error('offline')),
    remove: vi.fn().mockRejectedValue(new Error('offline')),
  }),
}))

describe('EcolifeService', () => {
  beforeEach(() => localStorage.clear())
  it('keeps swine and poultry diagnostics independent', async () => {
    const common = {
      clientId: 'client-1',
      clientName: 'Cliente Teste',
      propertyName: 'Farm',
      municipality: 'City',
      department: 'State',
      consultantName: 'Consultant',
      priority: 'MEDIA' as const,
      status: 'LEVANTAMENTO' as const,
      expectedRevenue: 0,
      answers: {},
      observations: '',
    }
    await EcolifeService.create({ ...common, product: 'SWINE' }, { id: '1', name: 'User' })
    expect(await EcolifeService.list('SWINE')).toHaveLength(1)
    expect(await EcolifeService.list('POULTRY')).toHaveLength(0)
  })
})
