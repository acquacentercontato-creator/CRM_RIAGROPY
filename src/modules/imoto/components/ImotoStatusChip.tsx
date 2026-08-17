import { Chip } from '@mui/material'
import type { ImotoStatus } from '@/modules/imoto/types/imotoTypes'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

type ImotoStatusChipProps = {
  status: ImotoStatus
}

const statusColor: Record<ImotoStatus, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  RASCUNHO: 'default',
  EM_ANALISE: 'info',
  ENVIADO: 'warning',
  ORÇAMENTO: 'info',
  APRESENTACAO: 'info',
  NEGOCIAÇÃO: 'warning',
  VENDIDO: 'success',
  CANCELADO: 'error',
  APROVADO: 'success',
  REPROVADO: 'error',
}

export const ImotoStatusChip = ({ status }: ImotoStatusChipProps) => {
  const ts = useTranslationService()
  return <Chip size="small" color={statusColor[status]} label={ts(`imoto.status.${status}`)} />
}
