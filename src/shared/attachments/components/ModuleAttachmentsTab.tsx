/**
 * Aba de anexos reutilizável para todos os módulos
 */

import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import DeleteIcon from '@mui/icons-material/Delete'
import DownloadIcon from '@mui/icons-material/Download'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import FavoriteIcon from '@mui/icons-material/Favorite'
import MapIcon from '@mui/icons-material/Map'
import UploadIcon from '@mui/icons-material/Upload'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { AttachmentService, AttachmentUploader, PreviewService } from '@/shared/attachments'
import type { AttachmentMetadata, ModuleContext } from '@/shared/attachments'
import { useAttachments } from '@/shared/attachments/hooks/useAttachments'
import { useRBAC } from '@/shared/hooks/useRBAC'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

interface ModuleAttachmentsTabProps {
  entityId: string
  entityNome: string
  moduloContext: ModuleContext
  projetoId?: string
  onUploadComplete?: () => void
}

export const ModuleAttachmentsTab = ({
  entityId,
  entityNome,
  moduloContext,
  projetoId,
  onUploadComplete,
}: ModuleAttachmentsTabProps) => {
  const ts = useTranslationService()
  const { can } = useRBAC()
  const [uploaderOpen, setUploaderOpen] = useState(false)
  const [previewAnexo, setPreviewAnexo] = useState<AttachmentMetadata | null>(null)

  const canUpload = can('arquivos', 'upload')
  const canDelete = can('arquivos', 'remove')

  const { data: anexos, loading, reload, deletar, toggleFavorito, stats } = useAttachments({
    entityId,
    moduloContext,
    enabled: Boolean(entityId),
  })

  if (!entityId) {
    return (
      <Alert severity="info" sx={{ mt: 1 }}>
        {ts('attachments.saveFirst')}
      </Alert>
    )
  }

  return (
    <Stack spacing={2} sx={{ pt: 1 }}>
      {/* Estatísticas */}
      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
        <Chip
          icon={<AttachFileIcon />}
          label={ts('attachments.count', { count: stats.total })}
          variant="outlined"
          size="small"
        />
        {stats.ultimoUpload && (
          <Chip
            label={ts('attachments.lastUpload', {
              data: new Date(stats.ultimoUpload).toLocaleDateString(),
            })}
            variant="outlined"
            size="small"
          />
        )}
        {stats.ultimaAlteracao && (
          <Chip
            label={ts('attachments.lastChange', {
              data: new Date(stats.ultimaAlteracao).toLocaleDateString(),
            })}
            variant="outlined"
            size="small"
          />
        )}
      </Stack>

      {/* Botão upload */}
      {canUpload && (
        <Box>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => setUploaderOpen(true)}
            size="small"
          >
            {ts('attachments.upload')}
          </Button>
        </Box>
      )}

      <Divider />

      {/* Lista de anexos */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={32} />
        </Box>
      ) : anexos.length === 0 ? (
        <Typography color="text.secondary">{ts('attachments.empty')}</Typography>
      ) : (
        <List disablePadding>
          {anexos.map((anexo) => (
            <AttachmentRow
              key={anexo.id}
              anexo={anexo}
              canDelete={canDelete}
              ts={ts}
              onPreview={() => setPreviewAnexo(anexo)}
              onDownload={() => AttachmentService.download(anexo.id, anexo.nome)}
              onToggleFavorito={() => toggleFavorito(anexo)}
              onDelete={() => deletar(anexo.id)}
            />
          ))}
        </List>
      )}

      {/* Uploader dialog */}
      <AttachmentUploader
        open={uploaderOpen}
        clienteId={entityId}
        clienteNome={entityNome}
        projetoId={projetoId}
        moduloContext={moduloContext}
        onClose={() => setUploaderOpen(false)}
        onUploadCompleto={() => {
          setUploaderOpen(false)
          reload()
          onUploadComplete?.()
        }}
      />

      {/* Preview dialog */}
      {previewAnexo && (
        <PreviewDialog
          anexo={previewAnexo}
          ts={ts}
          onClose={() => setPreviewAnexo(null)}
          onDownload={() => AttachmentService.download(previewAnexo.id, previewAnexo.nome)}
        />
      )}
    </Stack>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

interface AttachmentRowProps {
  anexo: AttachmentMetadata
  canDelete: boolean
  ts: (key: string, params?: Record<string, unknown>) => string
  onPreview: () => void
  onDownload: () => void
  onToggleFavorito: () => void
  onDelete: () => void
}

const AttachmentRow = ({
  anexo,
  canDelete,
  ts,
  onPreview,
  onDownload,
  onToggleFavorito,
  onDelete,
}: AttachmentRowProps) => {
  const isGeo = anexo.tipo === 'KMZ' || anexo.tipo === 'KML'
  const isCad = anexo.tipo === 'DWG' || anexo.tipo === 'DXF'
  const canPreview = PreviewService.suportaPreview(anexo.tipo)

  const openGoogleEarth = () => {
    window.open(`https://earth.google.com/web/@?q=${encodeURIComponent(anexo.url)}`, '_blank')
  }

  return (
    <ListItem
      disablePadding
      divider
      secondaryAction={
        <Stack direction="row" spacing={0.5}>
          <Tooltip title={ts(anexo.isFavorite ? 'attachments.unfavorite' : 'attachments.favorite')}>
            <IconButton size="small" onClick={onToggleFavorito}>
              {anexo.isFavorite ? (
                <FavoriteIcon fontSize="small" color="error" />
              ) : (
                <FavoriteBorderIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>

          {isGeo && (
            <Tooltip title={ts('attachments.openGoogleEarth')}>
              <IconButton size="small" onClick={openGoogleEarth}>
                <MapIcon fontSize="small" color="primary" />
              </IconButton>
            </Tooltip>
          )}

          {canPreview && !isGeo && (
            <Tooltip title={ts('attachments.preview')}>
              <IconButton size="small" onClick={onPreview}>
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title={ts('attachments.download')}>
            <IconButton size="small" onClick={onDownload}>
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {canDelete && (
            <Tooltip title={ts('attachments.delete')}>
              <IconButton size="small" onClick={onDelete} color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      }
    >
      <ListItemButton sx={{ pr: 18 }}>
        <ListItemIcon sx={{ minWidth: 36 }}>
          <Typography sx={{ fontSize: 20 }}>
            {isCad ? '🏗️' : PreviewService.obterIcone(anexo.tipo)}
          </Typography>
        </ListItemIcon>
        <ListItemText
          primary={
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="body2" noWrap sx={{ maxWidth: 220 }}>
                {anexo.nome}
              </Typography>
              <Chip
                label={anexo.tipo}
                size="small"
                variant="outlined"
                sx={{ fontSize: 10, height: 18 }}
              />
              {isCad && (
                <Chip
                  label="CAD"
                  size="small"
                  color="warning"
                  sx={{ fontSize: 10, height: 18 }}
                />
              )}
            </Stack>
          }
          secondary={
            <Typography variant="caption" color="text.secondary">
              {PreviewService.formatarTamanho(anexo.tamanho)} ·{' '}
              {new Date(anexo.criadoEm).toLocaleDateString()} · v{anexo.versao}
            </Typography>
          }
        />
      </ListItemButton>
    </ListItem>
  )
}

interface PreviewDialogProps {
  anexo: AttachmentMetadata
  ts: (key: string, params?: Record<string, unknown>) => string
  onClose: () => void
  onDownload: () => void
}

const PreviewDialog = ({ anexo, ts, onClose, onDownload }: PreviewDialogProps) => {
  const tipoPreview = PreviewService.obterTipoPreview(anexo.tipo)
  const previewUrl = PreviewService.gerarPreview(anexo.url, anexo.tipo)

  return (
    <Dialog open onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography>{PreviewService.obterIcone(anexo.tipo)}</Typography>
          <Typography variant="h6" noWrap>
            {anexo.nome}
          </Typography>
          <Chip label={anexo.tipo} size="small" variant="outlined" />
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ minHeight: 460 }}>
        {!previewUrl ? (
          <Typography color="text.secondary">{ts('attachments.noPreview')}</Typography>
        ) : tipoPreview === 'IMAGE' ? (
          <Box
            component="img"
            src={previewUrl}
            sx={{ maxWidth: '100%', maxHeight: 460, objectFit: 'contain', display: 'block', mx: 'auto' }}
          />
        ) : tipoPreview === 'VIDEO' ? (
          <Box component="video" src={previewUrl} controls sx={{ width: '100%', maxHeight: 460 }} />
        ) : (
          <Box
            component="iframe"
            src={previewUrl}
            sx={{ width: '100%', height: 460, border: 'none' }}
            title={anexo.nome}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{ts('actions.close')}</Button>
        <Button variant="contained" startIcon={<DownloadIcon />} onClick={onDownload}>
          {ts('attachments.download')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
