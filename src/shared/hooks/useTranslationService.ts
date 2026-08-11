import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { TranslationService, type TranslationOptions } from '@/shared/services/TranslationService'

export const useTranslationService = () => {
  const { i18n } = useTranslation()

  return useCallback((key: string, options?: TranslationOptions) => {
    return i18n.getFixedT(i18n.language)(key, options)
  }, [i18n])
}

export const useTranslationExists = () => {
  return useCallback((key: string) => TranslationService.exists(key), [])
}
