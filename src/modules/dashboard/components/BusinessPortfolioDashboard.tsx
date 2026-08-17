import { useMemo, useState } from 'react'
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded'
import TableViewRoundedIcon from '@mui/icons-material/TableViewRounded'
import TuneRoundedIcon from '@mui/icons-material/TuneRounded'
import {
  Button,
  Card,
  CardContent,
  Chip,
  FormControlLabel,
  Grid,
  Paper,
  Stack,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import {
  CorporateReportService,
  type CorporateReportKpi,
  type CorporateReportPayload,
} from '@/modules/administracao/services/CorporateReportService'
import { useRiegoLevantamentos } from '@/modules/riego/hooks/useRiegoData'
import { useImotoLevantamentos } from '@/modules/imoto/hooks/useImotoData'
import { useEcolifeDiagnostics } from '@/modules/ecolife/hooks/useEcolifeData'
import type { DashboardKpi } from '@/modules/dashboard/types/dashboardTypes'
import type { ImotoLevantamento } from '@/modules/imoto/types/imotoTypes'
import type { EcolifeDiagnostic } from '@/modules/ecolife/types/ecolifeTypes'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

type PortfolioRow = {
  id: string
  code: string
  client: string
  modality: string
  status: string
  date: string
  saleValue?: number
  commission?: number
}

const currency = new Intl.NumberFormat('es-PY', {
  style: 'currency',
  currency: 'PYG',
  maximumFractionDigits: 0,
})

const FinancialSummary = ({ rows, showValues }: { rows: PortfolioRow[]; showValues: boolean }) => {
  const sold = rows.filter((row) => row.status === 'VENDIDO')
  const totalSales = sold.reduce((total, row) => total + (row.saleValue || 0), 0)
  const totalCommission = sold.reduce((total, row) => total + (row.commission || 0), 0)
  const cards = [
    ['Projetos', String(rows.length)],
    ['Vendas concluídas', String(sold.length)],
    ['Valor real vendido', showValues ? currency.format(totalSales) : '••••••'],
    ['Comissão RIAGRO', showValues ? currency.format(totalCommission) : '••••••'],
  ]
  return (
    <Grid container spacing={2}>
      {cards.map(([label, value]) => (
        <Grid key={label} size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                {label}
              </Typography>
              <Typography variant="h5">{value}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

const StatusSummary = ({ rows }: { rows: PortfolioRow[] }) => {
  const totals = rows.reduce<Record<string, number>>((result, row) => {
    result[row.status] = (result[row.status] || 0) + 1
    return result
  }, {})

  return (
    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
      {Object.entries(totals).map(([status, total]) => (
        <Chip key={status} label={`${status.replaceAll('_', ' ')}: ${total}`} variant="outlined" />
      ))}
    </Stack>
  )
}

const ProjectTable = ({
  rows,
  showValues,
  financial = true,
}: {
  rows: PortfolioRow[]
  showValues: boolean
  financial?: boolean
}) => (
  <TableContainer component={Paper} variant="outlined">
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Código</TableCell>
          <TableCell>Cliente</TableCell>
          <TableCell>Modalidade</TableCell>
          <TableCell>Status</TableCell>
          {financial && <TableCell align="right">Valor da venda</TableCell>}
          {financial && <TableCell align="right">Comissão RIAGRO</TableCell>}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id} hover>
            <TableCell>{row.code}</TableCell>
            <TableCell>{row.client}</TableCell>
            <TableCell>{row.modality}</TableCell>
            <TableCell>
              <Chip size="small" label={row.status.replaceAll('_', ' ')} />
            </TableCell>
            {financial && (
              <TableCell align="right">
                {showValues ? currency.format(row.saleValue || 0) : '••••••'}
              </TableCell>
            )}
            {financial && (
              <TableCell align="right">
                {showValues ? currency.format(row.commission || 0) : '••••••'}
              </TableCell>
            )}
          </TableRow>
        ))}
        {rows.length === 0 && (
          <TableRow>
            <TableCell colSpan={financial ? 6 : 4} align="center">
              Nenhum projeto registrado.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </TableContainer>
)

export const BusinessPortfolioDashboard = ({
  commercialKpis,
}: {
  commercialKpis: DashboardKpi[]
}) => {
  const ts = useTranslationService()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [tab, setTab] = useState(0)
  const [showValues, setShowValues] = useState(
    () => localStorage.getItem('riagro.dashboard.showValues') !== 'false'
  )
  const { data: riego = [] } = useRiegoLevantamentos()
  const { data: imoto = [] } = useImotoLevantamentos()
  const { data: ecolife = [] } = useEcolifeDiagnostics()

  const riegoRows = useMemo<PortfolioRow[]>(
    () =>
      riego.map((item) => ({
        id: item.id,
        code: item.codigo,
        client: item.clienteNome,
        modality: item.segmento,
        status: item.status,
        date: item.updatedAt || item.createdAt,
      })),
    [riego]
  )
  const imotoRows = (segment: ImotoLevantamento['segmento']) =>
    imoto
      .filter((item) => item.segmento === segment)
      .map<PortfolioRow>((item) => ({
        id: item.id,
        code: item.codigo,
        client: item.clienteNome,
        modality: ts(`imoto.segments.${item.segmento}`),
        status: item.status,
        date: item.updatedAt || item.createdAt,
        saleValue: item.valorVenda ?? 0,
        commission: item.valorComissaoRiagro ?? 0,
      }))
  const ecolifeRows = ecolife.map<PortfolioRow>((item: EcolifeDiagnostic) => ({
    id: item.id,
    code: item.code,
    client: item.clientName,
    modality: ts(`ecolife.products.${item.product}`),
    status: item.status,
    date: item.updatedAt || item.createdAt,
    saleValue: item.saleValue ?? 0,
    commission: item.riagroCommission ?? 0,
  }))
  const portfolios = [
    riegoRows,
    imotoRows('FABRICA_RACOES'),
    imotoRows('TRANSPORTADORES_RODOVIARIOS'),
    ecolifeRows,
  ]
  const activeRows = portfolios[tab - 1] || []
  const reportDefinitions = [
    { title: 'Clientes e Comercial', subtitle: 'Clientes, agenda, visitas e oportunidades' },
    { title: 'Projetos de Irrigação', subtitle: 'Todas as modalidades e seus status' },
    { title: 'Fábricas de Ração', subtitle: 'Projetos, vendas e comissões' },
    { title: 'Transportadores Rodoviários', subtitle: 'Projetos, vendas e comissões' },
    { title: 'ECOLIFE', subtitle: 'Suinocultura e avicultura' },
  ]
  const definition = reportDefinitions[tab]
  const soldRows = activeRows.filter((row) => row.status === 'VENDIDO')
  const reportKpis: CorporateReportKpi[] = tab === 0
    ? commercialKpis.map((kpi) => ({ label: ts(kpi.label), value: String(kpi.value) }))
    : [
        { label: 'Projetos', value: String(activeRows.length) },
        { label: 'Vendas concluídas', value: String(soldRows.length) },
        { label: 'Valor real vendido', value: showValues && tab !== 1
          ? currency.format(soldRows.reduce((total, row) => total + (row.saleValue || 0), 0)) : 'Valores ocultos' },
        { label: 'Comissão RIAGRO', value: showValues && tab !== 1
          ? currency.format(soldRows.reduce((total, row) => total + (row.commission || 0), 0)) : 'Valores ocultos' },
      ]
  const reportPayload: CorporateReportPayload = {
    title: `Relatório Executivo · ${definition.title}`,
    subtitle: definition.subtitle,
    periodLabel: 'Período ativo no Dashboard',
    clientLabel: 'Todos os clientes',
    statusLabel: 'Todos os status',
    generatedBy: user?.name || user?.email || 'RIAGRO CRM',
    includeValues: showValues && tab > 1,
    kpis: reportKpis,
    rows: activeRows.map((row) => ({
      code: row.code,
      client: row.client,
      modality: row.modality,
      status: row.status,
      date: row.date,
      saleValue: row.saleValue,
      commission: row.commission,
    })),
  }

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        sx={{ justifyContent: 'space-between', alignItems: { md: 'center' } }}
        spacing={1}
      >
        <Typography variant="h5">Painéis gerenciais por unidade de negócio</Typography>
        <FormControlLabel
          control={
            <Switch
              checked={showValues}
              onChange={(event) => {
                const checked = event.target.checked
                setShowValues(checked)
                localStorage.setItem('riagro.dashboard.showValues', String(checked))
              }}
            />
          }
          label={showValues ? 'Valores visíveis' : 'Valores ocultos'}
        />
      </Stack>
      <Paper variant="outlined">
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="01 · Clientes e Comercial" />
          <Tab label="02 · Projetos de Irrigação" />
          <Tab label="03 · Fábricas de Ração" />
          <Tab label="04 · Transportadores Rodoviários" />
          <Tab label="05 · ECOLIFE" />
        </Tabs>
      </Paper>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}
        sx={{ justifyContent: 'flex-end' }}>
        <Button variant="text" startIcon={<TuneRoundedIcon />} onClick={() => navigate('/relatorios')}>
          Relatório com filtros avançados
        </Button>
        <Button variant="outlined" startIcon={<TableViewRoundedIcon />}
          onClick={() => CorporateReportService.downloadCsv(reportPayload)}>
          Exportar Excel/CSV
        </Button>
        <Button variant="contained" startIcon={<PictureAsPdfRoundedIcon />}
          onClick={() => CorporateReportService.downloadPdf(reportPayload)}>
          Baixar PDF desta aba
        </Button>
      </Stack>
      {tab === 0 ? (
        <Grid container spacing={2}>
          {commercialKpis.map((kpi) => (
            <Grid key={kpi.key} size={{ xs: 12, sm: 6, lg: 3 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography color="text.secondary">{ts(kpi.label)}</Typography>
                  <Typography variant="h5">{kpi.value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <>
          <FinancialSummary rows={activeRows} showValues={showValues} />
          <StatusSummary rows={activeRows} />
          <ProjectTable rows={activeRows} showValues={showValues} financial={tab !== 1} />
        </>
      )}
    </Stack>
  )
}
