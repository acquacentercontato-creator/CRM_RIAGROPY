import { Chip } from '@mui/material'
import type { ObraStatus } from '@/modules/obras/types/obrasTypes'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

type ObrasStatusChipProps = {
  status: ObraStatus
}

const colorByStatus: Record<ObraStatus, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  OBRA_CRIADA: 'default',
  PLANEJAMENTO: 'info',
  EXECUCAO: 'warning',
  ACOMPANHAMENTO: 'info',
  ENTREGA: 'success',
  ENCERRAMENTO: 'success',
}

export const ObrasStatusChip = ({ status }: ObrasStatusChipProps) => {
  const ts = useTranslationService()

  return <Chip size="small" color={colorByStatus[status]} label={ts(`obras.status.${status}`)} />
}
