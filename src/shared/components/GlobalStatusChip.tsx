import { Chip } from '@mui/material'
import { GLOBAL_STATUS_LABELS } from '@/shared/constants/globalStatus'
import type { EntityStatus } from '@/shared/types/core'

type GlobalStatusChipProps = {
  status: EntityStatus
}

const statusColor: Partial<Record<EntityStatus, 'default' | 'warning' | 'info' | 'success' | 'error'>> = {
  LEAD: 'info',
  CLIENTE: 'info',
  VISITA: 'info',
  LEVANTAMENTO: 'warning',
  'AGUARDANDO ENGENHARIA': 'warning',
  'EM PROJETO': 'warning',
  'AGUARDANDO MEMORIAL': 'warning',
  'PROJETO COMPLETO': 'success',
  'ORÇAMENTO': 'info',
  'NEGOCIAÇÃO': 'warning',
  VENDIDO: 'success',
  OBRA: 'info',
  ENTREGUE: 'success',
  GARANTIA: 'info',
  'ASSISTÊNCIA': 'info',
  CANCELADO: 'error',
  RASCUNHO: 'default',
  ATIVO: 'success',
  INATIVO: 'default',
  EM_ANALISE: 'info',
  ENVIADO: 'warning',
  APROVADO: 'success',
  REPROVADO: 'error',
  OBRA_CRIADA: 'default',
  PLANEJAMENTO: 'info',
  EXECUCAO: 'warning',
  ACOMPANHAMENTO: 'info',
  ENTREGA: 'success',
  ENCERRAMENTO: 'success',
}

export const GlobalStatusChip = ({ status }: GlobalStatusChipProps) => {
  return <Chip size="small" color={statusColor[status] ?? 'default'} label={GLOBAL_STATUS_LABELS[status]} />
}
