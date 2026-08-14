import type { EcolifeDiagnostic } from '@/modules/ecolife/types/ecolifeTypes'
import { RIAGRO_LOGO_DATA_URL } from '@/modules/ecolife/assets/riagroLogo'

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>'"]/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ||
      character
  )

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
    const popup = window.open('', '_blank', 'noopener,noreferrer')
    if (!popup) return
    const questions = Object.entries(item.answers)
      .map(
        ([key, value]) =>
          `<tr><th>${escapeHtml(translate(`ecolife.questions.${key}`))}</th><td>${escapeHtml(value)}</td></tr>`
      )
      .join('')
    popup.document.write(
      `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(item.code)}</title><style>@page{margin:18mm}*{box-sizing:border-box}body{font:14px Arial;color:#20352b;margin:0}.cover{min-height:245mm;display:grid;place-content:center;text-align:center;border:5px solid #2e7d32;padding:30px}.logo{width:min(620px,90%);margin:0 auto}.brand{font-size:20px;letter-spacing:3px;color:#4f6f58}h1{font-size:32px;margin-top:60px}h2{color:#2e7d32;border-bottom:2px solid #9bc8a3;padding-bottom:6px}.page{page-break-before:always;padding-bottom:25mm}table{width:100%;border-collapse:collapse;margin-bottom:24px}th,td{padding:9px;border:1px solid #ccd8d0;text-align:left;vertical-align:top}th{width:42%;background:#edf6ef}footer{position:fixed;bottom:0;width:100%;text-align:center;color:#587064;border-top:1px solid #ccd8d0;padding-top:7px}.signature{margin:80px auto 0;border-top:1px solid;width:280px;text-align:center;padding-top:8px}</style></head><body><header class="cover"><img class="logo" src="${RIAGRO_LOGO_DATA_URL}" alt="RIAGRO"><div class="brand">ECOLIFE</div><h1>${escapeHtml(translate('ecolife.pdf.title'))}<br>${escapeHtml(translate(`ecolife.products.${item.product}`))}</h1><p>${escapeHtml(item.code)}</p></header><main class="page"><h2>${escapeHtml(translate('ecolife.pdf.clientData'))}</h2><table><tr><th>${escapeHtml(translate('ecolife.fields.client'))}</th><td>${escapeHtml(item.clientName || '')}</td></tr><tr><th>${escapeHtml(translate('ecolife.fields.propertyName'))}</th><td>${escapeHtml(item.propertyName)}</td></tr><tr><th>${escapeHtml(translate('ecolife.fields.municipality'))}</th><td>${escapeHtml(item.municipality)}</td></tr><tr><th>${escapeHtml(translate('ecolife.fields.department'))}</th><td>${escapeHtml(item.department)}</td></tr><tr><th>${escapeHtml(translate('ecolife.fields.consultantName'))}</th><td>${escapeHtml(item.consultantName || '')}</td></tr><tr><th>${escapeHtml(translate('ecolife.pdf.date'))}</th><td>${escapeHtml(new Date(item.createdAt).toLocaleDateString(translate('ecolife.locale')))}</td></tr></table><h2>${escapeHtml(translate('ecolife.pdf.questionnaire'))}</h2><table>${questions}</table><h2>${escapeHtml(translate('ecolife.fields.observations'))}</h2><p>${escapeHtml(item.observations)}</p><div class="signature">${escapeHtml(translate('ecolife.pdf.signature'))}</div></main><footer>RIAGRO · ${escapeHtml(translate('ecolife.pdf.footer'))}</footer><script>window.onload=()=>window.print()</script></body></html>`
    )
    popup.document.close()
  },
}
