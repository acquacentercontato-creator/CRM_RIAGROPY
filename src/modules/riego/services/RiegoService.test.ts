import { describe, expect, it } from 'vitest'
import { RiegoService } from '@/modules/riego/services/RiegoService'
import type { RiegoLevantamentoForm } from '@/modules/riego/types/riegoTypes'

const basePayload: RiegoLevantamentoForm = {
  clienteNome: 'Cliente RC1',
  propriedade: 'Fazenda Central',
  responsavel: 'Tecnico 1',
  segmento: 'ASPERSAO',
  status: 'RASCUNHO',
  observacoes: 'Primeiro levantamento',
  gpsLat: '-23.1',
  gpsLng: '-46.7',
  questionnaire: { areaHa: '120' },
  fotos: [],
  videos: [],
  documentos: [],
}

describe('RiegoService', () => {
  it('create/list/update/remove no fallback local', async () => {
    const created = await RiegoService.create(basePayload, 'qa-user')

    expect(created.id).toBeTruthy()
    expect(created.codigo).toContain('RGO-')

    const listed = await RiegoService.list()
    expect(listed.some((item) => item.id === created.id)).toBe(true)

    const updated = await RiegoService.update(
      created.id,
      {
        ...basePayload,
        observacoes: 'Levantamento atualizado no RC1',
      },
      'qa-user-2'
    )

    expect(updated.observacoes).toContain('atualizado')
    expect(updated.timeline.length).toBeGreaterThan(1)

    await RiegoService.remove(created.id)
    const afterRemove = await RiegoService.list()

    expect(afterRemove.some((item) => item.id === created.id)).toBe(false)
  })
})
