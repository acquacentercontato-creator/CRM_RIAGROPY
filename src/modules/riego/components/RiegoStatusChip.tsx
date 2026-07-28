import { Chip } from '@mui/material'
import type { RiegoStatus } from '@/modules/riego/types/riegoTypes'
import { statusLabel } from '@/modules/riego/utils/riegoUtils'

type RiegoStatusChipProps = {
  status: RiegoStatus
}

const statusColor: Record<RiegoStatus, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  RASCUNHO: 'default',
  EM_ANALISE: 'info',
  ENVIADO_ENGENHARIA: 'warning',
  APROVADO_ENGENHARIA: 'success',
  REPROVADO_ENGENHARIA: 'error',
}

export const RiegoStatusChip = ({ status }: RiegoStatusChipProps) => {
  return <Chip size="small" color={statusColor[status]} label={statusLabel(status)} />
}
