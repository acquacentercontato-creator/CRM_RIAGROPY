import type { EcolifeDiagnostic } from '@/modules/ecolife/types/ecolifeTypes'
const pdfText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7e]/g, ' ')
    .replace(/([\\()])/g, '\\$1')

const wrap = (value: string, width = 92) => {
  const words = pdfText(value).split(/\s+/)
  const lines: string[] = []
  let line = ''
  words.forEach((word) => {
    if (`${line} ${word}`.trim().length > width) {
      if (line) lines.push(line)
      line = word
    } else line = `${line} ${word}`.trim()
  })
  if (line) lines.push(line)
  return lines
}

const createPdfBlob = (lines: string[]) => {
  const pages = Array.from({ length: Math.max(1, Math.ceil(lines.length / 48)) }, (_, index) =>
    lines.slice(index * 48, (index + 1) * 48)
  )
  const objects: string[] = []
  const pageRefs = pages.map((_, index) => `${4 + index * 2} 0 R`).join(' ')
  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>'
  objects[2] = `<< /Type /Pages /Kids [${pageRefs}] /Count ${pages.length} >>`
  objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
  pages.forEach((pageLines, index) => {
    const pageObject = 4 + index * 2
    const contentObject = pageObject + 1
    const content = `BT /F1 10 Tf 50 790 Td 14 TL ${pageLines
      .map((line) => `(${pdfText(line)}) Tj T*`)
      .join(' ')} ET`
    objects[pageObject] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObject} 0 R >>`
    objects[contentObject] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`
  })
  let output = '%PDF-1.4\n'
  const offsets = [0]
  for (let index = 1; index < objects.length; index += 1) {
    offsets[index] = output.length
    output += `${index} 0 obj\n${objects[index]}\nendobj\n`
  }
  const xref = output.length
  output += `xref\n0 ${objects.length}\n0000000000 65535 f \n`
  for (let index = 1; index < objects.length; index += 1)
    output += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`
  output += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
  return new Blob([output], { type: 'application/pdf' })
}

export const EcolifePdfService = {
  createFile(
    item: EcolifeDiagnostic,
    translate: (key: string, params?: Record<string, unknown>) => string
  ) {
    const lines = [
      'RIAGRO ECOLIFE',
      `${translate('ecolife.pdf.title')} - ${translate(`ecolife.products.${item.product}`)}`,
      item.code,
      '',
      `${translate('ecolife.fields.client')}: ${item.clientName}`,
      `${translate('ecolife.fields.propertyName')}: ${item.propertyName}`,
      `${translate('ecolife.fields.municipality')}: ${item.municipality}`,
      `${translate('ecolife.fields.department')}: ${item.department}`,
      `${translate('ecolife.fields.consultantName')}: ${item.consultantName}`,
      `${translate('ecolife.pdf.date')}: ${new Date(item.createdAt).toLocaleDateString(translate('ecolife.locale'))}`,
      '',
      translate('ecolife.pdf.questionnaire'),
      ...Object.entries(item.answers).flatMap(([key, value]) =>
        wrap(`${translate(`ecolife.questions.${key}`)}: ${value}`)
      ),
      '',
      `${translate('ecolife.fields.observations')}:`,
      ...wrap(item.observations || '-'),
      '',
      `____________________________  ${translate('ecolife.pdf.signature')}`,
      '',
      `RIAGRO - ${translate('ecolife.pdf.footer')}`,
    ]
    return new File([createPdfBlob(lines)], `${item.code}.pdf`, { type: 'application/pdf' })
  },
  print(
    item: EcolifeDiagnostic,
    translate: (key: string, params?: Record<string, unknown>) => string
  ) {
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
  },
}
