import { Chip } from '@mui/material'
import type { EngenhariaStatus } from '@/modules/engenharia/types/engenhariaTypes'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

type EngenhariaStatusChipProps = {
  status: EngenhariaStatus
}

const colorByStatus: Record<EngenhariaStatus, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  'AGUARDANDO ENGENHARIA': 'warning',
  'EM PROJETO': 'info',
  'AGUARDANDO MEMORIAL': 'warning',
  REVISAO: 'error',
  'PROJETO COMPLETO': 'success',
}

export const EngenhariaStatusChip = ({ status }: EngenhariaStatusChipProps) => {
  const ts = useTranslationService()

  return <Chip size="small" color={colorByStatus[status]} label={ts(`engenharia.status.${status}`)} />
}
