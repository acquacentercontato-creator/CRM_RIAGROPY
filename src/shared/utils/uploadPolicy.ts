import type { UploadFileCategory } from '@/shared/types/core'

const MB = 1024 * 1024

const ACCEPTED_MIME_BY_CATEGORY: Record<UploadFileCategory, string[]> = {
  FOTO: ['image/jpeg', 'image/png', 'image/webp'],
  VIDEO: ['video/mp4', 'video/webm', 'video/quicktime'],
  PDF: ['application/pdf'],
  DWG: ['application/acad', 'application/x-acad', 'image/vnd.dwg', 'application/octet-stream'],
  DXF: ['image/vnd.dxf', 'application/dxf', 'application/octet-stream'],
  KMZ: ['application/vnd.google-earth.kmz', 'application/zip', 'application/octet-stream'],
  OUTRO: ['application/pdf', 'text/plain', 'application/zip', 'application/octet-stream'],
}

const MAX_SIZE_BY_CATEGORY: Record<UploadFileCategory, number> = {
  FOTO: 8 * MB,
  VIDEO: 80 * MB,
  PDF: 20 * MB,
  DWG: 40 * MB,
  DXF: 40 * MB,
  KMZ: 20 * MB,
  OUTRO: 20 * MB,
}

const sanitizeFileName = (fileName: string): string => {
  const normalized = fileName.trim().replace(/\s+/g, '-')
  return normalized.replace(/[^a-zA-Z0-9._-]/g, '')
}

const extensionByCategory: Record<UploadFileCategory, string[]> = {
  FOTO: ['.jpg', '.jpeg', '.png', '.webp'],
  VIDEO: ['.mp4', '.webm', '.mov'],
  PDF: ['.pdf'],
  DWG: ['.dwg'],
  DXF: ['.dxf'],
  KMZ: ['.kmz'],
  OUTRO: ['.pdf', '.txt', '.zip', '.rar'],
}

export const assertUploadPolicy = (category: UploadFileCategory, file: File) => {
  const maxSize = MAX_SIZE_BY_CATEGORY[category]
  if (file.size <= 0 || file.size > maxSize) {
    throw new Error(`Arquivo excede limite permitido para ${category}`)
  }

  const allowedMimeTypes = ACCEPTED_MIME_BY_CATEGORY[category]
  const lowerName = file.name.toLowerCase()
  const validExtension = extensionByCategory[category].some((ext) => lowerName.endsWith(ext))
  const validMime = allowedMimeTypes.includes(file.type)

  if (!validMime && !validExtension) {
    throw new Error(`Tipo de arquivo nao permitido para ${category}`)
  }

  const safeName = sanitizeFileName(file.name)
  if (!safeName || safeName.length < 3) {
    throw new Error('Nome de arquivo invalido')
  }

  return {
    safeName,
  }
}
