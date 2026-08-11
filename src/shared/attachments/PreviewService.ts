/**
 * Serviço de Preview de anexos sem necessidade de download
 */

import type { AttachmentType } from './types'

export type PreviewType = 'PDF' | 'IMAGE' | 'VIDEO' | 'SPREADSHEET' | 'DOCUMENT' | 'UNSUPPORTED'

export interface PreviewData {
  tipo: PreviewType
  url: string
  nome: string
  tamanho: number
  mimeType: string
}

const PREVIEW_SUPPORTED: Record<AttachmentType, PreviewType> = {
  PDF: 'PDF',
  JPG: 'IMAGE',
  PNG: 'IMAGE',
  HEIC: 'IMAGE',
  DOCX: 'DOCUMENT',
  XLSX: 'SPREADSHEET',
  DWG: 'UNSUPPORTED',
  DXF: 'UNSUPPORTED',
  KMZ: 'UNSUPPORTED',
  KML: 'UNSUPPORTED',
  ZIP: 'UNSUPPORTED',
  MP4: 'VIDEO',
}

export const PreviewService = {
  /**
   * Verificar se tipo de arquivo suporta preview
   */
  suportaPreview(tipo: AttachmentType): boolean {
    const previewType = PREVIEW_SUPPORTED[tipo]
    return previewType !== 'UNSUPPORTED'
  },

  /**
   * Obter tipo de preview para um attachment type
   */
  obterTipoPreview(tipo: AttachmentType): PreviewType {
    return PREVIEW_SUPPORTED[tipo] || 'UNSUPPORTED'
  },

  /**
   * Gerar URL de preview para PDF (usando embed)
   */
  gerarPreviewPDF(url: string): string {
    // Usar Google Docs Viewer para PDF preview
    return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`
  },

  /**
   * Gerar URL de preview para imagem
   */
  gerarPreviewImagem(url: string): string {
    // Imagens podem ser exibidas diretamente
    return url
  },

  /**
   * Gerar URL de preview para vídeo
   */
  gerarPreviewVideo(url: string): string {
    // Vídeos podem ser exibidos com HTML5 video tag
    return url
  },

  /**
   * Gerar URL de preview para spreadsheet (usando Google Sheets Viewer)
   */
  gerarPreviewSpreadsheet(url: string): string {
    return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`
  },

  /**
   * Gerar URL de preview genérica baseado no tipo
   */
  gerarPreview(url: string, tipo: AttachmentType): string | null {
    const previewType = this.obterTipoPreview(tipo)

    switch (previewType) {
      case 'PDF':
        return this.gerarPreviewPDF(url)
      case 'IMAGE':
        return this.gerarPreviewImagem(url)
      case 'VIDEO':
        return this.gerarPreviewVideo(url)
      case 'SPREADSHEET':
        return this.gerarPreviewSpreadsheet(url)
      case 'DOCUMENT':
        return this.gerarPreviewSpreadsheet(url) // DOCX também funciona com Google Docs Viewer
      default:
        return null
    }
  },

  /**
   * Obter ícone para tipo de arquivo
   */
  obterIcone(tipo: AttachmentType): string {
    const iconMap: Record<AttachmentType, string> = {
      PDF: '📄',
      JPG: '🖼️',
      PNG: '🖼️',
      HEIC: '🖼️',
      DOCX: '📝',
      XLSX: '📊',
      DWG: '🏗️',
      DXF: '🏗️',
      KMZ: '🗺️',
      KML: '🗺️',
      ZIP: '📦',
      MP4: '🎬',
    }
    return iconMap[tipo] || '📎'
  },

  /**
   * Obter cor para tipo de arquivo
   */
  obterCor(tipo: AttachmentType): string {
    const colorMap: Record<AttachmentType, string> = {
      PDF: '#E53935',
      JPG: '#7B1FA2',
      PNG: '#7B1FA2',
      HEIC: '#7B1FA2',
      DOCX: '#1976D2',
      XLSX: '#388E3C',
      DWG: '#F57C00',
      DXF: '#F57C00',
      KMZ: '#00897B',
      KML: '#00897B',
      ZIP: '#455A64',
      MP4: '#D32F2F',
    }
    return colorMap[tipo] || '#424242'
  },

  /**
   * Formatar tamanho de arquivo em formato legível
   */
  formatarTamanho(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  },

  /**
   * Validar MIME type
   */
  validarMimeType(mimeType: string, tipo: AttachmentType): boolean {
    const mimeTypes: Record<AttachmentType, string[]> = {
      PDF: ['application/pdf'],
      JPG: ['image/jpeg'],
      PNG: ['image/png'],
      HEIC: ['image/heic'],
      DOCX: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      XLSX: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      DWG: ['application/vnd.autodesk.autocad.drawing'],
      DXF: ['image/vnd.dxf', 'application/dxf'],
      KMZ: ['application/vnd.google-earth.kmz'],
      KML: ['application/vnd.google-earth.kml+xml'],
      ZIP: ['application/zip'],
      MP4: ['video/mp4'],
    }

    const allowedMimeTypes = mimeTypes[tipo] || []
    return allowedMimeTypes.includes(mimeType)
  },

  /**
   * Detectar tipo de arquivo a partir da extensão
   */
  detectarTipo(nomeArquivo: string): AttachmentType | null {
    const extensao = nomeArquivo.split('.').pop()?.toLowerCase()

    const tiposMap: Record<string, AttachmentType> = {
      pdf: 'PDF',
      jpg: 'JPG',
      jpeg: 'JPG',
      png: 'PNG',
      heic: 'HEIC',
      docx: 'DOCX',
      doc: 'DOCX',
      xlsx: 'XLSX',
      xls: 'XLSX',
      dwg: 'DWG',
      dxf: 'DXF',
      kmz: 'KMZ',
      kml: 'KML',
      zip: 'ZIP',
      mp4: 'MP4',
      avi: 'MP4',
      mov: 'MP4',
    }

    return tiposMap[extensao || ''] || null
  },
}
