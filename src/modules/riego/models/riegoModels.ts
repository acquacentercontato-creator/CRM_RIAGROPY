import type { RiegoMediaType, RiegoSegment } from '@/modules/riego/types/riegoTypes'

export const RIEGO_COLLECTIONS = {
  levantamentos: 'riego_levantamentos',
} as const

export const RIEGO_STORAGE = {
  cacheLevantamentos: 'riagro.riego.levantamentos.v3',
  draftForm: 'riagro.riego.draft.v3',
} as const

export const RIEGO_SEGMENT_LABELS: Record<RiegoSegment, string> = {
  ASPERSAO: 'Aspersao',
  CARRETEL: 'Carretel',
  PIVO: 'Pivo',
  GOTEJAMENTO: 'Gotejamento',
  MICROASPERSAO: 'Microaspersao',
  RECALQUE: 'Recalque',
}

export const RIEGO_MEDIA_FOLDER: Record<RiegoMediaType, string> = {
  FOTO: 'fotos',
  VIDEO: 'videos',
  DOCUMENTO: 'documentos',
}

export const RIEGO_SEGMENT_QUESTIONS: Record<RiegoSegment, Array<{ key: string; label: string }>> = {
  ASPERSAO: [
    { key: 'areaHa', label: 'Area total (ha)' },
    { key: 'pressaoTrabalho', label: 'Pressao de trabalho (mca)' },
    { key: 'tipoAspersor', label: 'Tipo de aspersor' },
  ],
  CARRETEL: [
    { key: 'comprimentoFaixa', label: 'Comprimento da faixa (m)' },
    { key: 'diametroMangueira', label: 'Diametro da mangueira' },
    { key: 'vazaoProjeto', label: 'Vazao do projeto' },
  ],
  PIVO: [
    { key: 'raioPivo', label: 'Raio do pivo (m)' },
    { key: 'laminaDesejada', label: 'Lamina desejada (mm)' },
    { key: 'topografia', label: 'Topografia da area' },
  ],
  GOTEJAMENTO: [
    { key: 'espacamentoLinhas', label: 'Espacamento entre linhas (m)' },
    { key: 'vazaoEmissor', label: 'Vazao do emissor (l/h)' },
    { key: 'cultura', label: 'Cultura principal' },
  ],
  MICROASPERSAO: [
    { key: 'espacamentoPlantas', label: 'Espacamento entre plantas (m)' },
    { key: 'modeloMicroaspersor', label: 'Modelo de microaspersor' },
    { key: 'vazaoUnitaria', label: 'Vazao unitaria (l/h)' },
  ],
  RECALQUE: [
    { key: 'alturaManometrica', label: 'Altura manometrica total (m)' },
    { key: 'distanciaRecalque', label: 'Distancia de recalque (m)' },
    { key: 'diametroTubulacao', label: 'Diametro da tubulacao' },
  ],
}
