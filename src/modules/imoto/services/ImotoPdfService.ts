import { jsPDF } from 'jspdf'
import { RIAGRO_LOGO_DATA_URL as riagroLogo } from '@/assets/riagroLogo'
import modeloCabine from '@/modules/imoto/assets/transportadores/modelo-cabine.png'
import larguraChassi from '@/modules/imoto/assets/transportadores/largura-chassi.png'
import configuracaoVeiculo from '@/modules/imoto/assets/transportadores/configuracao-veiculo.png'
import dimensoesEntreEixos from '@/modules/imoto/assets/transportadores/dimensoes-entre-eixos.png'
import dimensoesQuartoEixo from '@/modules/imoto/assets/transportadores/dimensoes-quarto-eixo.png'
import dimensoesCaixas from '@/modules/imoto/assets/transportadores/dimensoes-caixas.png'
import materialTransportado from '@/modules/imoto/assets/transportadores/material-transportado.png'
import { IMOTO_SEGMENT_QUESTIONS } from '@/modules/imoto/models/imotoModels'
import type { ImotoLevantamento } from '@/modules/imoto/types/imotoTypes'

type Translate = (key: string, params?: Record<string, unknown>) => string

const PAGE_WIDTH = 210
const PAGE_HEIGHT = 297
const MARGIN = 16
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2
const FOOTER_Y = PAGE_HEIGHT - 10

const QUESTION_ILLUSTRATIONS: Record<string, string[]> = {
  tipoCabine: [modeloCabine],
  larguraChassi: [larguraChassi],
  configuracaoVeiculo: [configuracaoVeiculo],
  dimensoesEntreEixos: [dimensoesEntreEixos, dimensoesQuartoEixo],
  numeroCaixas: [dimensoesCaixas],
  formaMaterialTransportado: [materialTransportado],
}

const safeFilename = (value: string) =>
  value.trim().replace(/[^a-zA-Z0-9._-]+/g, '_') || 'levantamento-imoto'

const loadImage = (source: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Não foi possível carregar a ilustração: ${source}`))
    image.src = source
  })

const createDocument = async (item: ImotoLevantamento, translate: Translate) => {
  const document = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const illustrations = new Map<string, HTMLImageElement[]>()
  const sources = new Set([riagroLogo, ...Object.values(QUESTION_ILLUSTRATIONS).flat()])
  const loaded = await Promise.all(
    [...sources].map(async (source) => [source, await loadImage(source)] as const)
  )
  const images = new Map(loaded)
  Object.entries(QUESTION_ILLUSTRATIONS).forEach(([key, values]) => {
    illustrations.set(
      key,
      values
        .map((source) => images.get(source))
        .filter((image): image is HTMLImageElement => Boolean(image))
    )
  })

  let y = 16

  const addHeader = () => {
    const logo = images.get(riagroLogo)
    if (logo) document.addImage(logo, 'PNG', MARGIN, 8, 52, 15.75)
    document.setFont('helvetica', 'bold')
    document.setFontSize(9)
    document.setTextColor(25, 67, 47)
    document.text(item.codigo, PAGE_WIDTH - MARGIN, 18, { align: 'right' })
    document.setDrawColor(29, 119, 65)
    document.setLineWidth(0.7)
    document.line(MARGIN, 30, PAGE_WIDTH - MARGIN, 30)
  }

  const ensureSpace = (height: number) => {
    if (y + height <= FOOTER_Y - 8) return
    document.addPage()
    addHeader()
    y = 37
  }

  const addSection = (title: string) => {
    ensureSpace(13)
    document.setFillColor(29, 119, 65)
    document.roundedRect(MARGIN, y, CONTENT_WIDTH, 8, 1.5, 1.5, 'F')
    document.setFont('helvetica', 'bold')
    document.setFontSize(10)
    document.setTextColor(255, 255, 255)
    document.text(title, MARGIN + 4, y + 5.5)
    y += 11
  }

  const addField = (label: string, value: unknown) => {
    const displayValue = String(value ?? '').trim() || '-'
    const labelLines = document.splitTextToSize(label, 61) as string[]
    const valueLines = document.splitTextToSize(displayValue, 103) as string[]
    const height = Math.max(labelLines.length, valueLines.length) * 4.2 + 4
    ensureSpace(height)
    document.setFillColor(237, 246, 239)
    document.setDrawColor(202, 216, 207)
    document.rect(MARGIN, y, 66, height, 'FD')
    document.rect(MARGIN + 66, y, CONTENT_WIDTH - 66, height, 'S')
    document.setFontSize(8.2)
    document.setFont('helvetica', 'bold')
    document.setTextColor(25, 67, 47)
    document.text(labelLines, MARGIN + 3, y + 4.7)
    document.setFont('helvetica', 'normal')
    document.setTextColor(35, 45, 40)
    document.text(valueLines, MARGIN + 69, y + 4.7)
    y += height
  }

  const addIllustration = (image: HTMLImageElement) => {
    const ratio = image.naturalHeight / image.naturalWidth
    const height = Math.min(CONTENT_WIDTH * ratio, 92)
    const width = height / ratio
    ensureSpace(height + 6)
    document.setDrawColor(202, 216, 207)
    document.rect(MARGIN, y, CONTENT_WIDTH, height + 4, 'S')
    document.addImage(image, 'PNG', MARGIN + (CONTENT_WIDTH - width) / 2, y + 2, width, height)
    y += height + 6
  }

  addHeader()
  y = 38
  document.setFont('helvetica', 'bold')
  document.setFontSize(18)
  document.setTextColor(25, 67, 47)
  document.text('LEVANTAMENTO IMOTO', MARGIN, y)
  y += 7
  document.setFontSize(11)
  document.setTextColor(70, 85, 75)
  document.text(translate(`imoto.segments.${item.segmento}`), MARGIN, y)
  y += 9

  addSection('RESUMO DO LEVANTAMENTO')
  addField(translate('imoto.table.codigo'), item.codigo)
  addField(translate('imoto.table.cliente'), item.clienteNome)
  addField('Unidade industrial', item.unidadeIndustrial)
  addField(translate('imoto.table.responsavel'), item.responsavelTecnico)
  addField(translate('imoto.table.status'), translate(`imoto.status.${item.status}`))
  addField(
    'Data do levantamento',
    new Date(item.createdAt).toLocaleDateString(translate('imoto.locale'))
  )

  addSection('QUESTIONÁRIO TÉCNICO')
  IMOTO_SEGMENT_QUESTIONS[item.segmento].forEach((question) => {
    illustrations.get(question.key)?.forEach(addIllustration)
    addField(translate(`imoto.questions.${question.key}`), item.questionnaire[question.key])
  })

  addSection('OBSERVAÇÕES')
  addField('Observações', item.observacoes)

  const pageCount = document.getNumberOfPages()
  for (let page = 1; page <= pageCount; page += 1) {
    document.setPage(page)
    document.setDrawColor(202, 216, 207)
    document.line(MARGIN, FOOTER_Y - 4, PAGE_WIDTH - MARGIN, FOOTER_Y - 4)
    document.setFont('helvetica', 'normal')
    document.setFontSize(7)
    document.setTextColor(93, 108, 99)
    document.text('RIAGRO IMOTO | Relatório técnico', MARGIN, FOOTER_Y)
    document.text(`${page}/${pageCount}`, PAGE_WIDTH - MARGIN, FOOTER_Y, { align: 'right' })
  }

  document.setProperties({
    title: `Levantamento IMOTO - ${item.codigo}`,
    subject: translate(`imoto.segments.${item.segmento}`),
    author: 'RIAGRO',
    creator: 'CRM RIAGRO',
  })
  return document
}

export const ImotoPdfService = {
  async createFile(item: ImotoLevantamento, translate: Translate) {
    const filename = `${safeFilename(item.codigo)}-${safeFilename(item.clienteNome)}.pdf`
    const blob = (await createDocument(item, translate)).output('blob')
    return new File([blob], filename, { type: 'application/pdf' })
  },

  async download(item: ImotoLevantamento, translate: Translate) {
    const file = await this.createFile(item, translate)
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
}
