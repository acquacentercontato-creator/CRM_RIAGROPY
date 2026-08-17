import { useMemo, useState } from 'react'
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded'
import TableViewRoundedIcon from '@mui/icons-material/TableViewRounded'
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import {
  Alert, Box, Button, Card, CardContent, Chip, FormControl, FormControlLabel, Grid,
  InputLabel, MenuItem, Paper, Select, Stack, Switch, Tab, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Tabs, Typography,
} from '@mui/material'
import { useAuth } from '@/auth/AuthContext'
import { useExecutiveDashboard } from '@/modules/dashboard/hooks/useExecutiveDashboard'
import { useRiegoLevantamentos } from '@/modules/riego/hooks/useRiegoData'
import { useImotoLevantamentos } from '@/modules/imoto/hooks/useImotoData'
import { useEcolifeDiagnostics } from '@/modules/ecolife/hooks/useEcolifeData'
import {
  CorporateReportService,
  type CorporateReportKpi,
  type CorporateReportPayload,
  type CorporateReportRow,
} from '@/modules/administracao/services/CorporateReportService'
import { ModuleAttachmentsTab } from '@/shared/attachments'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

type ReportUnit = 'COMERCIAL' | 'RIEGO' | 'FABRICA_RACOES' | 'TRANSPORTADORES' | 'ECOLIFE'
type ReportPeriod = '30' | '90' | '365' | 'TODOS'

const UNITS: Array<{ value: ReportUnit; label: string; subtitle: string }> = [
  { value: 'COMERCIAL', label: '01 · Clientes e Comercial', subtitle: 'Clientes, agenda, visitas e oportunidades' },
  { value: 'RIEGO', label: '02 · Projetos de Irrigação', subtitle: 'Todas as modalidades e seus status' },
  { value: 'FABRICA_RACOES', label: '03 · Fábricas de Ração', subtitle: 'Projetos, vendas e comissões' },
  { value: 'TRANSPORTADORES', label: '04 · Transportadores Rodoviários', subtitle: 'Projetos, vendas e comissões' },
  { value: 'ECOLIFE', label: '05 · ECOLIFE', subtitle: 'Suinocultura e avicultura' },
]
const PERIODS: Array<{ value: ReportPeriod; label: string }> = [
  { value: '30', label: 'Últimos 30 dias' },
  { value: '90', label: 'Últimos 90 dias' },
  { value: '365', label: 'Últimos 12 meses' },
  { value: 'TODOS', label: 'Todo o histórico' },
]
const currency = new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 })
const formatDate = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('pt-BR')
}
const isInsidePeriod = (value: string, period: ReportPeriod) => {
  if (period === 'TODOS') return true
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return true
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - Number(period))
  return date >= cutoff
}

const SummaryCards = ({ kpis }: { kpis: CorporateReportKpi[] }) => (
  <Grid container spacing={2}>
    {kpis.slice(0, 8).map((kpi) => (
      <Grid key={kpi.label} size={{ xs: 12, sm: 6, lg: 3 }}>
        <Card variant="outlined" sx={{ height: '100%' }}><CardContent>
          <Typography variant="body2" color="text.secondary">{kpi.label}</Typography>
          <Typography variant="h5" sx={{ mt: 0.5 }}>{kpi.value}</Typography>
        </CardContent></Card>
      </Grid>
    ))}
  </Grid>
)

export const RelatoriosPage = () => {
  const ts = useTranslationService()
  const { user } = useAuth()
  const [tab, setTab] = useState(0)
  const [unit, setUnit] = useState<ReportUnit>('COMERCIAL')
  const [period, setPeriod] = useState<ReportPeriod>('30')
  const [client, setClient] = useState('TODOS')
  const [status, setStatus] = useState('TODOS')
  const [includeValues, setIncludeValues] = useState(false)
  const {
    data: dashboard,
    isLoading: dashboardLoading,
    filters: dashboardFilters,
    setFilters: setDashboardFilters,
  } = useExecutiveDashboard()
  const { data: riego = [], isLoading: riegoLoading } = useRiegoLevantamentos()
  const { data: imoto = [], isLoading: imotoLoading } = useImotoLevantamentos()
  const { data: ecolife = [], isLoading: ecolifeLoading } = useEcolifeDiagnostics()

  const rowsByUnit = useMemo<Record<Exclude<ReportUnit, 'COMERCIAL'>, CorporateReportRow[]>>(() => ({
    RIEGO: riego.map((item) => ({ code: item.codigo, client: item.clienteNome,
      modality: ts(`riego.segments.${item.segmento}`), status: item.status, date: item.updatedAt || item.createdAt })),
    FABRICA_RACOES: imoto.filter((item) => item.segmento === 'FABRICA_RACOES').map((item) => ({
      code: item.codigo, client: item.clienteNome, modality: ts(`imoto.segments.${item.segmento}`),
      status: item.status, date: item.updatedAt || item.createdAt, saleValue: item.valorVenda,
      commission: item.valorComissaoRiagro })),
    TRANSPORTADORES: imoto.filter((item) => item.segmento === 'TRANSPORTADORES_RODOVIARIOS').map((item) => ({
      code: item.codigo, client: item.clienteNome, modality: ts(`imoto.segments.${item.segmento}`),
      status: item.status, date: item.updatedAt || item.createdAt, saleValue: item.valorVenda,
      commission: item.valorComissaoRiagro })),
    ECOLIFE: ecolife.map((item) => ({ code: item.code, client: item.clientName,
      modality: ts(`ecolife.products.${item.product}`), status: item.status, date: item.updatedAt || item.createdAt,
      saleValue: item.saleValue, commission: item.riagroCommission })),
  }), [ecolife, imoto, riego, ts])

  const sourceRows = useMemo(
    () => unit === 'COMERCIAL' ? [] : rowsByUnit[unit],
    [rowsByUnit, unit],
  )
  const clients = useMemo(() => [...new Set(sourceRows.map((row) => row.client).filter(Boolean))].sort(), [sourceRows])
  const statuses = useMemo(() => [...new Set(sourceRows.map((row) => row.status).filter(Boolean))].sort(), [sourceRows])
  const rows = useMemo(() => sourceRows.filter((row) =>
    isInsidePeriod(row.date, period) && (client === 'TODOS' || row.client === client) &&
    (status === 'TODOS' || row.status === status)), [client, period, sourceRows, status])
  const sold = rows.filter((row) => row.status === 'VENDIDO')
  const sales = sold.reduce((sum, row) => sum + (row.saleValue ?? 0), 0)
  const commissions = sold.reduce((sum, row) => sum + (row.commission ?? 0), 0)
  const selected = UNITS.find((option) => option.value === unit) ?? UNITS[0]
  const kpis = useMemo<CorporateReportKpi[]>(() => unit === 'COMERCIAL'
    ? (dashboard?.kpis ?? []).map((kpi) => ({ label: ts(kpi.label), value: String(kpi.value) }))
    : [
        { label: 'Projetos no período', value: String(rows.length) },
        { label: 'Vendas concluídas', value: String(sold.length) },
        { label: 'Valor real vendido', value: includeValues ? currency.format(sales) : 'Valores ocultos' },
        { label: 'Comissão RIAGRO', value: includeValues ? currency.format(commissions) : 'Valores ocultos' },
      ], [commissions, dashboard?.kpis, includeValues, rows.length, sales, sold.length, ts, unit])
  const showFinancial = includeValues && unit !== 'COMERCIAL' && unit !== 'RIEGO'
  const payload: CorporateReportPayload = {
    title: `Relatório Executivo · ${selected.label.replace(/^\d+ · /, '')}`,
    subtitle: selected.subtitle,
    periodLabel: PERIODS.find((option) => option.value === period)?.label ?? period,
    clientLabel: client === 'TODOS' ? 'Todos os clientes' : client,
    statusLabel: status === 'TODOS' ? 'Todos os status' : status.replaceAll('_', ' '),
    generatedBy: user?.name || user?.email || 'RIAGRO CRM', includeValues: showFinancial, kpis, rows,
  }
  const loading = dashboardLoading || riegoLoading || imotoLoading || ecolifeLoading
  const selectUnit = (next: ReportUnit) => { setUnit(next); setClient('TODOS'); setStatus('TODOS') }
  const selectPeriod = (next: ReportPeriod) => {
    setPeriod(next)
    if (next !== 'TODOS') {
      const dashboardPeriod = { '30': '30_DIAS', '90': '90_DIAS', '365': '12_MESES' } as const
      setDashboardFilters({ ...dashboardFilters, period: dashboardPeriod[next] })
    }
  }

  return <Stack spacing={2.5}>
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ justifyContent: 'space-between' }}>
      <Box><Typography variant="h4">Central Corporativa de Relatórios</Typography>
        <Typography color="text.secondary">Relatórios RIAGRO para análise gerencial e apresentações externas.</Typography></Box>
      <Chip label="Padrão executivo RIAGRO" color="success" variant="outlined" />
    </Stack>
    <Alert severity="info">Os filtros da tela são reproduzidos no PDF e no arquivo para Excel. Valores financeiros começam ocultos.</Alert>
    <Paper sx={{ p: 2 }}>
      <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 2 }}>
        <Tab label="Relatórios executivos" /><Tab label={ts('attachments.tab')} />
      </Tabs>
      {tab === 0 && <Stack spacing={2.5}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}><FormControl fullWidth><InputLabel>Unidade de negócio</InputLabel>
            <Select value={unit} label="Unidade de negócio" onChange={(event) => selectUnit(event.target.value as ReportUnit)}>
              {UNITS.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
            </Select></FormControl></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}><FormControl fullWidth><InputLabel>Período</InputLabel>
            <Select value={period} label="Período" onChange={(event) => selectPeriod(event.target.value as ReportPeriod)}>
              {PERIODS.map((option) => <MenuItem key={option.value} value={option.value}
                disabled={unit === 'COMERCIAL' && option.value === 'TODOS'}>{option.label}</MenuItem>)}
            </Select></FormControl></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}><FormControl fullWidth disabled={unit === 'COMERCIAL'}><InputLabel>Cliente</InputLabel>
            <Select value={client} label="Cliente" onChange={(event) => setClient(event.target.value)}>
              <MenuItem value="TODOS">Todos os clientes</MenuItem>{clients.map((name) => <MenuItem key={name} value={name}>{name}</MenuItem>)}
            </Select></FormControl></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}><FormControl fullWidth disabled={unit === 'COMERCIAL'}><InputLabel>Status</InputLabel>
            <Select value={status} label="Status" onChange={(event) => setStatus(event.target.value)}>
              <MenuItem value="TODOS">Todos os status</MenuItem>{statuses.map((item) => <MenuItem key={item} value={item}>{item.replaceAll('_', ' ')}</MenuItem>)}
            </Select></FormControl></Grid>
        </Grid>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}
          sx={{ justifyContent: 'space-between', alignItems: { md: 'center' } }}>
          <FormControlLabel control={<Switch checked={includeValues} disabled={unit === 'COMERCIAL' || unit === 'RIEGO'}
            onChange={(event) => setIncludeValues(event.target.checked)} />}
            label={includeValues ? 'Valores financeiros visíveis' : 'Valores financeiros ocultos'} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button variant="outlined" startIcon={<TableViewRoundedIcon />} disabled={loading}
              onClick={() => CorporateReportService.downloadCsv(payload)}>Exportar Excel/CSV</Button>
            <Button variant="contained" startIcon={<PictureAsPdfRoundedIcon />} disabled={loading}
              onClick={() => CorporateReportService.downloadPdf(payload)}>Baixar PDF executivo</Button>
          </Stack>
        </Stack>
        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Stack direction="row" sx={{ mb: 2, justifyContent: 'space-between', alignItems: 'center' }}>
            <Box><Typography variant="h5">{selected.label}</Typography><Typography color="text.secondary">{selected.subtitle}</Typography></Box>
            <Chip icon={showFinancial ? <VisibilityRoundedIcon /> : <VisibilityOffRoundedIcon />}
              label={showFinancial ? 'Com valores' : 'Modo apresentação'} color={showFinancial ? 'success' : 'default'} />
          </Stack>
          <SummaryCards kpis={kpis} />
          {unit !== 'COMERCIAL' && <TableContainer sx={{ mt: 2, maxHeight: 420 }}><Table stickyHeader size="small">
            <TableHead><TableRow><TableCell>Código</TableCell><TableCell>Cliente</TableCell><TableCell>Modalidade</TableCell>
              <TableCell>Status</TableCell><TableCell>Atualização</TableCell>{showFinancial && <TableCell align="right">Venda</TableCell>}
              {showFinancial && <TableCell align="right">Comissão</TableCell>}</TableRow></TableHead>
            <TableBody>{rows.map((row) => <TableRow key={`${row.code}-${row.client}`} hover><TableCell>{row.code}</TableCell>
              <TableCell>{row.client}</TableCell><TableCell>{row.modality}</TableCell><TableCell><Chip size="small" label={row.status.replaceAll('_', ' ')} /></TableCell>
              <TableCell>{formatDate(row.date)}</TableCell>{showFinancial && <TableCell align="right">{currency.format(row.saleValue ?? 0)}</TableCell>}
              {showFinancial && <TableCell align="right">{currency.format(row.commission ?? 0)}</TableCell>}</TableRow>)}
              {rows.length === 0 && <TableRow><TableCell colSpan={showFinancial ? 7 : 5} align="center">Nenhum registro encontrado para os filtros selecionados.</TableCell></TableRow>}
            </TableBody></Table></TableContainer>}
        </Paper>
      </Stack>}
      {tab === 1 && <ModuleAttachmentsTab entityId="relatorios-global" entityNome={ts('pages.relatorios.title')} moduloContext="COMERCIAL" />}
    </Paper>
  </Stack>
}
