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
      `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(item.code)}</title><style>@page{margin:18mm}*{box-sizing:border-box}body{font:14px Arial;color:#20352b;margin:0}.cover{min-height:245mm;display:grid;place-content:center;text-align:center;border:5px solid #2e7d32;padding:30px}.logo{font-size:42px;font-weight:900;letter-spacing:5px;color:#1b5e20}.brand{font-size:20px;letter-spacing:3px;color:#4f6f58}h1{font-size:32px;margin-top:60px}h2{color:#2e7d32;border-bottom:2px solid #9bc8a3;padding-bottom:6px}.page{page-break-before:always;padding-bottom:25mm}table{width:100%;border-collapse:collapse;margin-bottom:24px}th,td{padding:9px;border:1px solid #ccd8d0;text-align:left;vertical-align:top}th{width:42%;background:#edf6ef}footer{position:fixed;bottom:0;width:100%;text-align:center;color:#587064;border-top:1px solid #ccd8d0;padding-top:7px}.signature{margin:80px auto 0;border-top:1px solid;width:280px;text-align:center;padding-top:8px}</style></head><body><header class="cover"><div class="logo">RIAGRO</div><div class="brand">ECOLIFE</div><h1>${escapeHtml(translate('ecolife.pdf.title'))}<br>${escapeHtml(translate(`ecolife.products.${item.product}`))}</h1><p>${escapeHtml(item.code)}</p></header><main class="page"><h2>${escapeHtml(translate('ecolife.pdf.clientData'))}</h2><table><tr><th>${escapeHtml(translate('ecolife.fields.propertyName'))}</th><td>${escapeHtml(item.propertyName)}</td></tr><tr><th>${escapeHtml(translate('ecolife.fields.municipality'))}</th><td>${escapeHtml(item.municipality)}</td></tr><tr><th>${escapeHtml(translate('ecolife.fields.department'))}</th><td>${escapeHtml(item.department)}</td></tr><tr><th>${escapeHtml(translate('ecolife.fields.consultantName'))}</th><td>${escapeHtml(item.consultantName || '')}</td></tr><tr><th>${escapeHtml(translate('ecolife.pdf.date'))}</th><td>${escapeHtml(new Date(item.createdAt).toLocaleDateString(translate('ecolife.locale')))}</td></tr></table><h2>${escapeHtml(translate('ecolife.pdf.questionnaire'))}</h2><table>${questions}</table><h2>${escapeHtml(translate('ecolife.fields.observations'))}</h2><p>${escapeHtml(item.observations)}</p><div class="signature">${escapeHtml(translate('ecolife.pdf.signature'))}</div></main><footer>RIAGRO · ${escapeHtml(translate('ecolife.pdf.footer'))}</footer><script>window.onload=()=>window.print()</script></body></html>`
    )
    popup.document.close()
  },
}
