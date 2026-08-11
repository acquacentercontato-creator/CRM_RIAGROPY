import { esPY } from '@/i18n/es-PY'
import { gnPY } from '@/i18n/gn-PY'
import { ptBR } from '@/i18n/pt-BR'

export const resources = {
  'pt-BR': {
    translation: ptBR,
  },
  'es-PY': {
    translation: esPY,
  },
  'gn-PY': {
    translation: gnPY,
  },
} as const

export type AppLanguage = keyof typeof resources
