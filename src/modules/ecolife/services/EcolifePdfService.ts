import type { EcolifeDiagnostic } from '@/modules/ecolife/types/ecolifeTypes'

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>'"]/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ||
      character
  )

export const EcolifePdfService = {
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
      `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(item.code)}</title><style>@page{margin:18mm}body{font:14px Arial;color:#20352b}header{min-height:70vh;display:grid;place-content:center;text-align:center;border:4px solid #2e7d32}h1{font-size:32px}h2{color:#2e7d32}.page{page-break-before:always}table{width:100%;border-collapse:collapse}th,td{padding:9px;border:1px solid #ccd8d0;text-align:left}th{width:42%;background:#edf6ef}footer{position:fixed;bottom:0;width:100%;text-align:center;color:#587064}.signature{margin-top:70px;border-top:1px solid;width:260px;text-align:center}</style></head><body><header><h2>RIAGRO ECOLIFE</h2><h1>${escapeHtml(translate('ecolife.pdf.title'))}<br>${escapeHtml(translate(`ecolife.products.${item.product}`))}</h1><p>${escapeHtml(item.code)}</p></header><main class="page"><h2>${escapeHtml(translate('ecolife.pdf.clientData'))}</h2><table><tr><th>${escapeHtml(translate('ecolife.fields.propertyName'))}</th><td>${escapeHtml(item.propertyName)}</td></tr><tr><th>${escapeHtml(translate('ecolife.fields.municipality'))}</th><td>${escapeHtml(item.municipality)}</td></tr><tr><th>${escapeHtml(translate('ecolife.fields.department'))}</th><td>${escapeHtml(item.department)}</td></tr></table><h2>${escapeHtml(translate('ecolife.pdf.questionnaire'))}</h2><table>${questions}</table><h2>${escapeHtml(translate('ecolife.fields.observations'))}</h2><p>${escapeHtml(item.observations)}</p><h2>${escapeHtml(translate('ecolife.pdf.attachments'))}</h2><p>${escapeHtml(translate('ecolife.pdf.attachmentsReference'))}</p><div class="signature">${escapeHtml(translate('ecolife.pdf.signature'))}</div></main><footer>RIAGRO · ${escapeHtml(translate('ecolife.pdf.footer'))}</footer><script>window.onload=()=>window.print()</script></body></html>`
    )
    popup.document.close()
  },
}
