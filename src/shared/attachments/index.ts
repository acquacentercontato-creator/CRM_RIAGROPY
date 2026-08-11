/**
 * Exportações do módulo de anexos
 */

export type {
  AttachmentType,
  AttachmentCategory,
  AttachmentStatus,
  ModuleContext,
  AttachmentMetadata,
  AttachmentVersion,
  AttachmentHistory,
  AttachmentSearchFilter,
  AttachmentUploadRequest,
  AttachmentPreviewConfig,
  AttachmentFavorito,
  AttachmentRecente,
} from './types'

export { AttachmentService } from './AttachmentService'
export { PreviewService, type PreviewType, type PreviewData } from './PreviewService'
export { VersioningService } from './VersioningService'
export { SearchService } from './SearchService'
export { AttachmentsPanel, AttachmentUploader, ModuleAttachmentsTab } from './components'
export { useAttachments } from './hooks/useAttachments'
