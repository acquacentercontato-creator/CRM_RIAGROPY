/**
 * KPIs do CRM Comercial
 */

import { Grid, Paper, Stack, Typography } from '@mui/material'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import GroupIcon from '@mui/icons-material/Group'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import ThumbDownIcon from '@mui/icons-material/ThumbDown'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import TimerIcon from '@mui/icons-material/Timer'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import type { Oportunidade, Visita } from '@/modules/comercial/types'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

interface CRMKpiPanelProps {
  oportunidades: Oportunidade[]
  visitas: Visita[]
}

const fmt = (value: number, currency: boolean, locale: string, currencyCode: string) => {
  if (currency) {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode, notation: 'compact' }).format(value)
  }
  return value.toFixed(0)
}

export const CRMKpiPanel = ({ oportunidades, visitas }: CRMKpiPanelProps) => {
  const ts = useTranslationService()
  const locale = ts('crm.currency.locale')
  const currencyCode = ts('crm.currency.code')

  const totalPipeline = oportunidades.reduce((sum, o) => sum + (o.valorEstimado ?? 0), 0)
  const fechadas = oportunidades.filter((o) => o.etapaFunil === 'FECHAMENTO' || o.etapaFunil === 'EXECUCAO' || o.etapaFunil === 'POS_VENDA')
  const perdidas = oportunidades.filter((o) => o.nivel === 'BAIXA' && o.etapaFunil === 'LEAD')
  const emNegociacao = oportunidades.filter((o) => o.etapaFunil === 'NEGOCIACAO' || o.etapaFunil === 'APRESENTACAO')

  const taxaConversao = oportunidades.length > 0
    ? ((fechadas.length / oportunidades.length) * 100).toFixed(1)
    : '0'

  const ticketMedio = fechadas.length > 0
    ? fechadas.reduce((sum, o) => sum + (o.valorEstimado ?? 0), 0) / fechadas.length
    : 0

  const semanaPassada = new Date()
  semanaPassada.setDate(semanaPassada.getDate() - 7)
  const visitasSemana = visitas.filter((v) => new Date(v.data) >= semanaPassada).length

  const clientesAtivos = new Set(oportunidades.map((o) => o.clienteId)).size

  const kpis = [
    {
      label: ts('crm.kpi.valorPipeline'),
      value: fmt(totalPipeline, true, locale, currencyCode),
      icon: <AccountBalanceWalletIcon color="primary" />,
      color: 'primary.main',
    },
    {
      label: ts('crm.kpi.emNegociacao'),
      value: fmt(emNegociacao.reduce((s, o) => s + (o.valorEstimado ?? 0), 0), true, locale, currencyCode),
      icon: <TrendingUpIcon color="warning" />,
      color: 'warning.main',
    },
    {
      label: ts('crm.kpi.taxaConversao'),
      value: `${taxaConversao}%`,
      icon: <ShowChartIcon color="success" />,
      color: 'success.main',
    },
    {
      label: ts('crm.kpi.ticketMedio'),
      value: fmt(ticketMedio, true, locale, currencyCode),
      icon: <TimerIcon color="info" />,
      color: 'info.main',
    },
    {
      label: ts('crm.kpi.ganhos'),
      value: fmt(fechadas.length, false, locale, currencyCode),
      icon: <ThumbUpIcon color="success" />,
      color: 'success.main',
    },
    {
      label: ts('crm.kpi.perdidos'),
      value: fmt(perdidas.length, false, locale, currencyCode),
      icon: <ThumbDownIcon color="error" />,
      color: 'error.main',
    },
    {
      label: ts('crm.kpi.visitasSemana'),
      value: fmt(visitasSemana, false, locale, currencyCode),
      icon: <GroupIcon color="primary" />,
      color: 'primary.main',
    },
    {
      label: ts('crm.kpi.clientesAtivos'),
      value: fmt(clientesAtivos, false, locale, currencyCode),
      icon: <GroupIcon color="secondary" />,
      color: 'secondary.main',
    },
  ]

  return (
    <Grid container spacing={1.5}>
      {kpis.map((kpi) => (
        <Grid key={kpi.label} size={{ xs: 6, sm: 4, md: 3 }}>
          <Paper variant="outlined" sx={{ p: 1.5 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              {kpi.icon}
              <Stack>
                <Typography variant="h6" sx={{ color: kpi.color, fontWeight: 700, lineHeight: 1 }}>
                  {kpi.value}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                  {kpi.label}
                </Typography>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      ))}
    </Grid>
  )
}
