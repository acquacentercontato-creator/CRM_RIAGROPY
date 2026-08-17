import { jsPDF } from 'jspdf'
import { RIAGRO_LOGO_DATA_URL as riagroLogo } from '@/assets/riagroLogo'
import type { EcolifeDiagnostic } from '@/modules/ecolife/types/ecolifeTypes'

type Translate = (key: string, params?: Record<string, unknown>) => string

const PAGE_WIDTH = 210
const PAGE_HEIGHT = 297
const MARGIN = 18
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2
const FOOTER_Y = PAGE_HEIGHT - 12

const safeFilename = (value: string) =>
  value.trim().replace(/[^a-zA-Z0-9._-]+/g, '_') || 'levantamento-ecolife'

const formatDate = (value: string, locale: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString(locale)
}

const createDocument = (item: EcolifeDiagnostic, translate: Translate) => {
  const document = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const locale = translate('ecolife.locale')
  const priority = item.priority || 'MEDIA'
  let y = 18

  const addPageHeader = () => {
    document.addImage(riagroLogo, 'PNG', MARGIN, 10, 56, 17)
    document.setDrawColor(33, 111, 62)
    document.setLineWidth(0.7)
    document.line(MARGIN, 34, PAGE_WIDTH - MARGIN, 34)
    document.setFont('helvetica', 'bold')
    document.setFontSize(9)
    document.setTextColor(70, 85, 75)
    document.text(item.code, PAGE_WIDTH - MARGIN, 23, { align: 'right' })
  }

  const ensureSpace = (height: number) => {
    if (y + height <= FOOTER_Y - 8) return
    document.addPage()
    addPageHeader()
    y = 42
  }

  const addSection = (title: string) => {
    ensureSpace(14)
    document.setFillColor(33, 111, 62)
    document.roundedRect(MARGIN, y, CONTENT_WIDTH, 9, 1.5, 1.5, 'F')
    document.setFont('helvetica', 'bold')
    document.setFontSize(10)
    document.setTextColor(255, 255, 255)
    document.text(title, MARGIN + 4, y + 6)
    y += 13
  }

  const addField = (label: string, value: unknown) => {
    const displayValue = String(value ?? '').trim() || '-'
    const labelLines = document.splitTextToSize(label, 53) as string[]
    const valueLines = document.splitTextToSize(displayValue, 107) as string[]
    const rowHeight = Math.max(labelLines.length, valueLines.length) * 4.4 + 5
    ensureSpace(rowHeight)
    document.setFillColor(237, 246, 239)
    document.setDrawColor(202, 216, 207)
    document.rect(MARGIN, y, 58, rowHeight, 'FD')
    document.rect(MARGIN + 58, y, CONTENT_WIDTH - 58, rowHeight, 'S')
    document.setFontSize(8.5)
    document.setFont('helvetica', 'bold')
    document.setTextColor(25, 67, 47)
    document.text(labelLines, MARGIN + 3, y + 5)
    document.setFont('helvetica', 'normal')
    document.setTextColor(35, 45, 40)
    document.text(valueLines, MARGIN + 61, y + 5)
    y += rowHeight
  }

  addPageHeader()
  y = 43
  document.setFont('helvetica', 'bold')
  document.setFontSize(18)
  document.setTextColor(25, 67, 47)
  document.text(translate('ecolife.pdf.title'), MARGIN, y)
  y += 8
  document.setFontSize(12)
  document.setTextColor(70, 85, 75)
  document.text(translate(`ecolife.products.${item.product}`), MARGIN, y)
  y += 10

  addSection(translate('ecolife.pdf.summary'))
  addField(translate('ecolife.pdf.modality'), translate(`ecolife.products.${item.product}`))
  addField(translate('ecolife.pdf.date'), formatDate(item.createdAt, locale))
  addField(translate('ecolife.fields.priority'), translate(`ecolife.priorities.${priority}`))
  addField(translate('ecolife.fields.status'), translate(`ecolife.status.${item.status}`))
  addField(translate('ecolife.fields.client'), item.clientName)
  addField(translate('ecolife.fields.propertyName'), item.propertyName)
  addField(translate('ecolife.fields.municipality'), item.municipality)
  addField(translate('ecolife.fields.department'), item.department)
  addField(translate('ecolife.fields.consultantName'), item.consultantName)

  addSection(translate('ecolife.pdf.questionnaire'))
  Object.entries(item.answers).forEach(([key, value]) => {
    addField(translate(`ecolife.questions.${key}`), value)
  })

  addSection(translate('ecolife.fields.observations'))
  addField(translate('ecolife.fields.observations'), item.observations)

  const pageCount = document.getNumberOfPages()
  for (let page = 1; page <= pageCount; page += 1) {
    document.setPage(page)
    document.setDrawColor(202, 216, 207)
    document.line(MARGIN, FOOTER_Y - 5, PAGE_WIDTH - MARGIN, FOOTER_Y - 5)
    document.setFont('helvetica', 'normal')
    document.setFontSize(7)
    document.setTextColor(93, 108, 99)
    document.text(`RIAGRO ECOLIFE | ${translate('ecolife.pdf.footer')}`, MARGIN, FOOTER_Y)
    document.text(`${page}/${pageCount}`, PAGE_WIDTH - MARGIN, FOOTER_Y, { align: 'right' })
  }

  document.setProperties({
    title: `${translate('ecolife.pdf.title')} - ${item.code}`,
    subject: translate(`ecolife.products.${item.product}`),
    author: 'RIAGRO',
    creator: 'CRM RIAGRO',
  })
  return document
}

export const EcolifePdfService = {
  createFile(item: EcolifeDiagnostic, translate: Translate) {
    const filename = `${safeFilename(item.code)}-${safeFilename(item.propertyName)}.pdf`
    const blob = createDocument(item, translate).output('blob')
    return new File([blob], filename, { type: 'application/pdf' })
  },

  download(item: EcolifeDiagnostic, translate: Translate) {
    const file = this.createFile(item, translate)
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = file.name
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    return file
  },

  print(item: EcolifeDiagnostic, translate: Translate) {
    return this.download(item, translate)
  },
}
