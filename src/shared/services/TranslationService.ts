import i18n from '@/i18n'

export type TranslationOptions = {
  defaultValue?: string
  [key: string]: unknown
}

const t = (key: string, options?: TranslationOptions) => {
  return i18n.t(key, options)
}

const exists = (key: string) => i18n.exists(key)

export const TranslationService = {
  t,
  exists,
}
