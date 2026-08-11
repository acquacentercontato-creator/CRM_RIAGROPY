/**
 * Funil de vendas Kanban com 10 etapas
 */

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import PercentIcon from '@mui/icons-material/Percent'
import PersonIcon from '@mui/icons-material/Person'
import type { FunilEtapa, Oportunidade } from '@/modules/comercial/types'
import { FUNIL_ETAPAS } from '@/modules/comercial/types'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

const ETAPA_COLORS: Record<FunilEtapa, string> = {
  LEAD: '#9E9E9E',
  CONTATO: '#2196F3',
  VISITA: '#03A9F4',
  LEVANTAMENTO: '#009688',
  PROJETO: '#4CAF50',
  APRESENTACAO: '#8BC34A',
  NEGOCIACAO: '#FF9800',
  FECHAMENTO: '#FF5722',
  EXECUCAO: '#9C27B0',
  POS_VENDA: '#3F51B5',
}

const NIVEL_COLOR = { ALTA: 'success', MEDIA: 'warning', BAIXA: 'default' } as const

interface CRMFunilViewProps {
  oportunidades: Oportunidade[]
  onMover?: (oportunidadeId: string, novaEtapa: FunilEtapa) => void
  onEditar?: (oportunidade: Oportunidade) => void
}

export const CRMFunilView = ({ oportunidades, onMover, onEditar }: CRMFunilViewProps) => {
  const ts = useTranslationService()

  const porEtapa = (etapa: FunilEtapa) =>
    oportunidades.filter((o) => (o.etapaFunil ?? 'LEAD') === etapa)

  const valorEtapa = (etapa: FunilEtapa) =>
    porEtapa(etapa).reduce((sum, o) => sum + (o.valorEstimado ?? 0), 0)

  const moverPara = (oportunidade: Oportunidade, delta: -1 | 1) => {
    const idx = FUNIL_ETAPAS.indexOf(oportunidade.etapaFunil ?? 'LEAD')
    const novaEtapa = FUNIL_ETAPAS[idx + delta]
    if (novaEtapa && onMover) onMover(oportunidade.id, novaEtapa)
  }

  return (
    <Box sx={{ overflowX: 'auto', pb: 1 }}>
      <Stack direction="row" spacing={1.5} sx={{ minWidth: FUNIL_ETAPAS.length * 220 }}>
        {FUNIL_ETAPAS.map((etapa) => {
          const cards = porEtapa(etapa)
          const total = valorEtapa(etapa)

          return (
            <Box
              key={etapa}
              sx={{
                width: 210,
                flexShrink: 0,
                bgcolor: 'background.paper',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Column header */}
              <Box
                sx={{
                  p: 1,
                  bgcolor: ETAPA_COLORS[etapa],
                  color: 'white',
                  borderRadius: '4px 4px 0 0',
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
                  {ts(`crm.funil.${etapa}`)}
                </Typography>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption">{cards.length} {ts('crm.funil.registros')}</Typography>
                  {total > 0 && (
                    <Typography variant="caption">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(total)}
                    </Typography>
                  )}
                </Stack>
              </Box>

              {/* Cards */}
              <Box sx={{ p: 0.5, flex: 1, minHeight: 200, maxHeight: 400, overflowY: 'auto' }}>
                <Stack spacing={0.5}>
                  {cards.map((op) => {
                    const etapaIdx = FUNIL_ETAPAS.indexOf(op.etapaFunil ?? 'LEAD')
                    return (
                      <Card key={op.id} variant="outlined" sx={{ cursor: 'pointer' }}>
                        <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }} noWrap>
                            {op.clienteNome}
                          </Typography>

                          <Stack spacing={0.25} sx={{ mt: 0.5 }}>
                            {op.valorEstimado && (
                              <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center' }}>
                                <AttachMoneyIcon sx={{ fontSize: 12, color: 'success.main' }} />
                                <Typography variant="caption" color="success.main">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(op.valorEstimado)}
                                </Typography>
                              </Stack>
                            )}
                            {op.probabilidade !== undefined && (
                              <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center' }}>
                                <PercentIcon sx={{ fontSize: 12 }} />
                                <Typography variant="caption">{op.probabilidade}%</Typography>
                              </Stack>
                            )}
                            {op.responsavel && (
                              <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center' }}>
                                <PersonIcon sx={{ fontSize: 12 }} />
                                <Typography variant="caption" noWrap>{op.responsavel}</Typography>
                              </Stack>
                            )}
                          </Stack>

                          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                            <Chip
                              label={ts(`crm.nivel.${op.nivel}`)}
                              size="small"
                              color={NIVEL_COLOR[op.nivel]}
                              sx={{ fontSize: 9, height: 16 }}
                            />
                            <Stack direction="row">
                              <Tooltip title={ts('crm.funil.moverEsquerda')}>
                                <span>
                                  <IconButton
                                    size="small"
                                    disabled={etapaIdx === 0}
                                    onClick={() => moverPara(op, -1)}
                                  >
                                    <ArrowBackIcon sx={{ fontSize: 12 }} />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title={ts('crm.funil.moverDireita')}>
                                <span>
                                  <IconButton
                                    size="small"
                                    disabled={etapaIdx === FUNIL_ETAPAS.length - 1}
                                    onClick={() => moverPara(op, 1)}
                                  >
                                    <ArrowForwardIcon sx={{ fontSize: 12 }} />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </Stack>
                          </Stack>

                          {onEditar && (
                            <Button size="small" sx={{ mt: 0.5, p: 0, fontSize: 10 }} onClick={() => onEditar(op)}>
                              {ts('actions.edit')}
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}

                  {cards.length === 0 && (
                    <Typography variant="caption" color="text.disabled" sx={{ textAlign: 'center', py: 2, display: 'block' }}>
                      {ts('crm.funil.vazio')}
                    </Typography>
                  )}
                </Stack>
              </Box>
            </Box>
          )
        })}
      </Stack>
    </Box>
  )
}
