import { describe, expect, it } from 'vitest'
import { ArquivoService } from '@/shared/services/ArquivoService'

describe('ArquivoService', () => {
  it('falha upload quando storage nao esta configurado', async () => {
    const file = new File(['conteudo'], 'arquivo.pdf', { type: 'application/pdf' })

    await expect(ArquivoService.upload('PDF', file, 'testes')).rejects.toThrow(
      'Storage indisponivel para upload'
    )
  })
})
