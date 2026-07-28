import { Chip } from '@mui/material'
import type { ImotoStatus } from '@/modules/imoto/types/imotoTypes'
import { statusLabel } from '@/modules/imoto/utils/imotoUtils'

type ImotoStatusChipProps = {
  status: ImotoStatus
}

const statusColor: Record<ImotoStatus, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  RASCUNHO: 'default',
  EM_ANALISE: 'info',
  ENVIADO: 'warning',
  APROVADO: 'success',
  REPROVADO: 'error',
}

export const ImotoStatusChip = ({ status }: ImotoStatusChipProps) => {
  return <Chip size="small" color={statusColor[status]} label={statusLabel(status)} />
}
