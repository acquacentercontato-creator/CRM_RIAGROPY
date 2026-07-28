import { describe, expect, it } from 'vitest'
import { assertUploadPolicy } from '@/shared/utils/uploadPolicy'

describe('uploadPolicy', () => {
  it('aceita arquivo pdf valido', () => {
    const file = new File(['conteudo'], 'documento.pdf', { type: 'application/pdf' })

    const result = assertUploadPolicy('PDF', file)

    expect(result.safeName).toBe('documento.pdf')
  })

  it('reprova tipo incompativel', () => {
    const file = new File(['conteudo'], 'script.exe', { type: 'application/x-msdownload' })

    expect(() => assertUploadPolicy('PDF', file)).toThrow('Tipo de arquivo nao permitido')
  })
})
