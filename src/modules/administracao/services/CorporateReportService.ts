import { jsPDF } from 'jspdf'
import { RIAGRO_LOGO_DATA_URL } from '@/assets/riagroLogo'

export type CorporateReportRow = {
  code: string
  client: string
  modality: string
  status: string
  date: string
  saleValue?: number
  commission?: number
}

export type CorporateReportKpi = {
  label: string
  value: string
}

export type CorporateReportPayload = {
  title: string
  subtitle: string
  periodLabel: string
  statusLabel: string
  clientLabel: string
  generatedBy: string
  includeValues: boolean
  kpis: CorporateReportKpi[]
  rows: CorporateReportRow[]
}

const PAGE_WIDTH = 297
const PAGE_HEIGHT = 210
const MARGIN = 14
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2
const FOOTER_Y = PAGE_HEIGHT - 10
const GREEN = [30, 119, 65] as const
const NAVY = [4, 44, 85] as const
const LIGHT_GREEN = [238, 247, 241] as const

const currency = new Intl.NumberFormat('es-PY', {
  style: 'currency',
  currency: 'PYG',
  maximumFractionDigits: 0,
})

const safeFilename = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'relatorio-riagro'

const formatDate = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('pt-BR')
}

const escapeCsv = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`

const downloadCsvFile = (title: string, lines: string[]) => {
  const blob = new Blob([`\uFEFF${lines.join('\n')}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${safeFilename(title)}_${new Date().toISOString().slice(0, 10)}.csv`
  anchor.click()
  URL.revokeObjectURL(url)
}

const addPageFooter = (document: jsPDF, page: number, total: number) => {
  document.setDrawColor(205, 215, 209)
  document.line(MARGIN, FOOTER_Y - 4, PAGE_WIDTH - MARGIN, FOOTER_Y - 4)
  document.setFont('helvetica', 'normal')
  document.setFontSize(7)
  document.setTextColor(...NAVY)
  document.text('RIAGRO CRM · Documento gerencial confidencial', MARGIN, FOOTER_Y)
  document.text(`Página ${page} de ${total}`, PAGE_WIDTH - MARGIN, FOOTER_Y, { align: 'right' })
}

const buildDocument = (payload: CorporateReportPayload) => {
  const document = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  let y = 12

  const addHeader = () => {
    document.addImage(RIAGRO_LOGO_DATA_URL, 'PNG', MARGIN, 8, 58, 17.5)
    document.setFont('helvetica', 'bold')
    document.setFontSize(17)
    document.setTextColor(...NAVY)
    document.text(payload.title, PAGE_WIDTH - MARGIN, 15, { align: 'right' })
    document.setFont('helvetica', 'normal')
    document.setFontSize(9)
    document.setTextColor(75, 85, 80)
    document.text(payload.subtitle, PAGE_WIDTH - MARGIN, 21, { align: 'right' })
    document.setDrawColor(...GREEN)
    document.setLineWidth(0.8)
    document.line(MARGIN, 29, PAGE_WIDTH - MARGIN, 29)
    y = 35
  }

  const addMetadata = () => {
    document.setFillColor(...LIGHT_GREEN)
    document.roundedRect(MARGIN, y, CONTENT_WIDTH, 14, 2, 2, 'F')
    document.setFontSize(8)
    document.setTextColor(...NAVY)
    document.setFont('helvetica', 'bold')
    document.text('PERÍODO', MARGIN + 4, y + 5)
    document.text('CLIENTE', MARGIN + 72, y + 5)
    document.text('STATUS', MARGIN + 145, y + 5)
    document.text('EMITIDO POR', MARGIN + 210, y + 5)
    document.setFont('helvetica', 'normal')
    document.text(payload.periodLabel, MARGIN + 4, y + 10.5)
    document.text(payload.clientLabel, MARGIN + 72, y + 10.5)
    document.text(payload.statusLabel, MARGIN + 145, y + 10.5)
    document.text(payload.generatedBy, MARGIN + 210, y + 10.5)
    y += 20
  }

  const addKpis = () => {
    const gap = 4
    const width = (CONTENT_WIDTH - gap * 3) / 4
    payload.kpis.slice(0, 8).forEach((kpi, index) => {
      if (index === 4) y += 22
      const column = index % 4
      const x = MARGIN + column * (width + gap)
      document.setFillColor(249, 251, 250)
      document.setDrawColor(215, 223, 218)
      document.roundedRect(x, y, width, 18, 2, 2, 'FD')
      document.setFont('helvetica', 'normal')
      document.setFontSize(7.5)
      document.setTextColor(80, 90, 85)
      document.text(document.splitTextToSize(kpi.label, width - 6), x + 3, y + 5)
      document.setFont('helvetica', 'bold')
      document.setFontSize(13)
      document.setTextColor(...NAVY)
      document.text(kpi.value, x + 3, y + 14)
    })
    y += 25
  }

  const addStatusSummary = () => {
    if (payload.rows.length === 0) return
    const totals = payload.rows.reduce<Record<string, number>>((result, row) => {
      result[row.status] = (result[row.status] ?? 0) + 1
      return result
    }, {})
    document.setFont('helvetica', 'bold')
    document.setFontSize(10)
    document.setTextColor(...NAVY)
    document.text('Distribuição por status', MARGIN, y)
    y += 5
    const entries = Object.entries(totals)
    entries.forEach(([status, total], index) => {
      const width = Math.max(20, (total / payload.rows.length) * 92)
      const x = MARGIN + (index % 3) * 92
      if (index > 0 && index % 3 === 0) y += 9
      document.setFillColor(...LIGHT_GREEN)
      document.roundedRect(x, y, 88, 7, 1, 1, 'F')
      document.setFillColor(...GREEN)
      document.roundedRect(x, y, Math.min(width, 88), 7, 1, 1, 'F')
      document.setFontSize(7)
      document.setTextColor(...NAVY)
      document.text(`${status.replaceAll('_', ' ')} · ${total}`, x + 2, y + 5)
    })
    y += 13
  }

  const columnWidths = payload.includeValues
    ? [22, 43, 38, 32, 22, 56, 56]
    : [30, 75, 65, 55, 44]
  const headers = payload.includeValues
    ? ['Código', 'Cliente', 'Modalidade', 'Status', 'Data', 'Venda', 'Comissão RIAGRO']
    : ['Código', 'Cliente', 'Modalidade', 'Status', 'Data']

  const addTableHeader = () => {
    document.setFillColor(...NAVY)
    document.rect(MARGIN, y, CONTENT_WIDTH, 8, 'F')
    document.setFont('helvetica', 'bold')
    document.setFontSize(7.5)
    document.setTextColor(255, 255, 255)
    let x = MARGIN
    headers.forEach((header, index) => {
      document.text(header, x + 2, y + 5.3)
      x += columnWidths[index]
    })
    y += 8
  }

  const addTable = () => {
    document.setFont('helvetica', 'bold')
    document.setFontSize(10)
    document.setTextColor(...NAVY)
    document.text('Detalhamento', MARGIN, y)
    y += 4
    addTableHeader()
    payload.rows.forEach((row, rowIndex) => {
      if (y + 8 > FOOTER_Y - 7) {
        document.addPage()
        addHeader()
        addTableHeader()
      }
      if (rowIndex % 2 === 0) {
        document.setFillColor(246, 249, 247)
        document.rect(MARGIN, y, CONTENT_WIDTH, 7.5, 'F')
      }
      const values = [row.code, row.client, row.modality, row.status.replaceAll('_', ' '), formatDate(row.date)]
      if (payload.includeValues) {
        values.push(currency.format(row.saleValue ?? 0), currency.format(row.commission ?? 0))
      }
      document.setFont('helvetica', 'normal')
      document.setFontSize(7)
      document.setTextColor(35, 45, 40)
      let x = MARGIN
      values.forEach((value, index) => {
        const clipped = document.splitTextToSize(value || '-', columnWidths[index] - 4)[0] || '-'
        document.text(clipped, x + 2, y + 5)
        x += columnWidths[index]
      })
      y += 7.5
    })
    if (payload.rows.length === 0) {
      document.setFont('helvetica', 'normal')
      document.setFontSize(9)
      document.setTextColor(90, 100, 95)
      document.text('Nenhum registro encontrado para os filtros selecionados.', MARGIN + 3, y + 7)
    }
  }

  addHeader()
  addMetadata()
  addKpis()
  addStatusSummary()
  addTable()

  const totalPages = document.getNumberOfPages()
  for (let page = 1; page <= totalPages; page += 1) {
    document.setPage(page)
    addPageFooter(document, page, totalPages)
  }
  return document
}

export const CorporateReportService = {
  downloadPdf(payload: CorporateReportPayload) {
    const date = new Date().toISOString().slice(0, 10)
    buildDocument(payload).save(`${safeFilename(payload.title)}_${date}.pdf`)
  },

  downloadCsv(payload: CorporateReportPayload) {
    if (payload.rows.length === 0) {
      const lines = ['Indicador;Valor', ...payload.kpis.map((kpi) =>
        `${escapeCsv(kpi.label)};${escapeCsv(kpi.value)}`)]
      downloadCsvFile(payload.title, lines)
      return
    }

    const headers = ['Código', 'Cliente', 'Modalidade', 'Status', 'Data']
    if (payload.includeValues) headers.push('Valor da venda (PYG)', 'Comissão RIAGRO (PYG)')
    const lines = [headers.map(escapeCsv).join(';')]
    payload.rows.forEach((row) => {
      const values: Array<string | number> = [row.code, row.client, row.modality, row.status, formatDate(row.date)]
      if (payload.includeValues) values.push(row.saleValue ?? 0, row.commission ?? 0)
      lines.push(values.map(escapeCsv).join(';'))
    })
    downloadCsvFile(payload.title, lines)
  },
}
