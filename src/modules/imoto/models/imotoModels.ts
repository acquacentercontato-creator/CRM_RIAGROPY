import type { ImotoSegment, ImotoUploadCategory } from '@/modules/imoto/types/imotoTypes'

export const IMOTO_COLLECTIONS = {
  levantamentos: 'imoto_levantamentos',
} as const

export const IMOTO_STORAGE = {
  cacheLevantamentos: 'riagro.imoto.levantamentos.v3',
  draftForm: 'riagro.imoto.draft.v3',
} as const

export const IMOTO_SEGMENT_LABELS: Record<ImotoSegment, string> = {
  FABRICA_RACOES: 'Fabrica de Racoes',
  TRANSPORTADORES_RODOVIARIOS: 'Transportadores Rodoviarios',
}

export const IMOTO_MEDIA_FOLDER: Record<ImotoUploadCategory, string> = {
  FOTO: 'fotos',
  VIDEO: 'videos',
  PDF: 'pdfs',
  DWG: 'dwgs',
  DXF: 'dxfs',
  KMZ: 'kmzs',
}

export const IMOTO_MEDIA_KEYS = {
  FOTO: 'fotos',
  VIDEO: 'videos',
  PDF: 'pdfs',
  DWG: 'dwgs',
  DXF: 'dxfs',
  KMZ: 'kmzs',
} as const

export const IMOTO_SEGMENT_QUESTIONS: Record<
  ImotoSegment,
  Array<{ key: string; label: string }>
> = {
  FABRICA_RACOES: [
    { key: 'capacidadeProducaoDia', label: 'Capacidade de producao por dia (t)' },
    { key: 'tipoMisturador', label: 'Tipo de misturador principal' },
    { key: 'numeroSilos', label: 'Numero de silos de armazenamento' },
    { key: 'demandaAutomacao', label: 'Demanda de automacao industrial' },
  ],
  TRANSPORTADORES_RODOVIARIOS: [
    { key: 'capacidadeTransporteHora', label: 'Capacidade de transporte por hora (t/h)' },
    { key: 'comprimentoRotas', label: 'Comprimento total das rotas (m)' },
    { key: 'tipoAcionamento', label: 'Tipo de acionamento dos transportadores' },
    { key: 'pontosTransferencia', label: 'Quantidade de pontos de transferencia' },
  ],
}
