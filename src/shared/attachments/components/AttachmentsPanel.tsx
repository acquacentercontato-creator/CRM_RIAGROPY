/**
 * Componente para exibir e gerenciar anexos de um recurso
 */

import { useEffect, useState } from 'react'
import {
  Stack,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Chip,
  Tooltip,
  CircularProgress,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import DownloadIcon from '@mui/icons-material/Download'
import VisibilityIcon from '@mui/icons-material/Visibility'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import FavoriteIcon from '@mui/icons-material/Favorite'
import { AttachmentService, PreviewService, type AttachmentMetadata } from '@/shared/attachments'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

interface AttachmentsPanelProps {
  clienteId: string
  titulo?: string
  maxHeight?: number
}

export const AttachmentsPanel = ({
  clienteId,
  titulo,
  maxHeight = 400,
}: AttachmentsPanelProps) => {
  const ts = useTranslationService()
  const [anexos, setAnexos] = useState<AttachmentMetadata[]>([])
  const [loading, setLoading] = useState(true)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [anexoSelecionado, setAnexoSelecionado] = useState<AttachmentMetadata | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isMounted = true
    AttachmentService.listarPorCliente(clienteId).then((data) => {
      if (isMounted) {
        setAnexos(data)
        setLoading(false)
      }
    })
    return () => { isMounted = false }
  }, [clienteId, reloadKey])

  const recarregar = () => setReloadKey((k) => k + 1)

  const handleDeletar = async (id: string) => {
    await AttachmentService.deletar(id)
    recarregar()
  }

  const handleDownload = async (anexo: AttachmentMetadata) => {
    await AttachmentService.download(anexo.id, anexo.nome)
  }

  const handleVisualizacao = (anexo: AttachmentMetadata) => {
    setAnexoSelecionado(anexo)
    setPreviewOpen(true)
  }

  const handleToggleFavorito = async (anexo: AttachmentMetadata) => {
    if (anexo.isFavorite) {
      await AttachmentService.removerDosFavoritos(anexo.id)
    } else {
      await AttachmentService.adicionarAosFavoritos(anexo.id)
    }
    recarregar()
  }

  if (loading) {
    return (
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress size={40} />
        </Box>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h6">{titulo ?? ts('attachments.tab')}</Typography>
        
        {anexos.length === 0 ? (
          <Typography color="text.secondary">{ts('attachments.empty')}</Typography>
        ) : (
          <List sx={{ maxHeight: maxHeight, overflow: 'auto' }}>
            {anexos.map((anexo) => (
              <ListItem
                key={anexo.id}
                secondaryAction={
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title={ts('attachments.favorite')}>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => handleToggleFavorito(anexo)}
                      >
                        {anexo.isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                      </IconButton>
                    </Tooltip>
                    {PreviewService.suportaPreview(anexo.tipo) && (
                      <Tooltip title={ts('attachments.preview')}>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => handleVisualizacao(anexo)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title={ts('attachments.download')}>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => handleDownload(anexo)}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={ts('attachments.delete')}>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => handleDeletar(anexo.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                }
                disablePadding
              >
                <ListItemButton sx={{ py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Typography sx={{ fontSize: 24 }}>
                      {PreviewService.obterIcone(anexo.tipo)}
                    </Typography>
                  </ListItemIcon>
                  <ListItemText
                    primary={anexo.nome}
                    secondary={
                      <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                        <Chip
                          label={PreviewService.formatarTamanho(anexo.tamanho)}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={anexo.tipo}
                          size="small"
                          variant="outlined"
                        />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(anexo.criadoEm).toLocaleDateString()}
                        </Typography>
                      </Stack>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Stack>

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>{anexoSelecionado?.nome}</DialogTitle>
        <DialogContent sx={{ minHeight: 500 }}>
          {anexoSelecionado && (
            <AttachmentPreviewContent anexo={anexoSelecionado} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>{ts('actions.close')}</Button>
          {anexoSelecionado && (
            <Button
              variant="contained"
              onClick={() => handleDownload(anexoSelecionado)}
            >
              {ts('actions.download')}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

interface AttachmentPreviewContentProps {
  anexo: AttachmentMetadata
}

const AttachmentPreviewContent = ({ anexo }: AttachmentPreviewContentProps) => {
  const ts = useTranslationService()
  const previewUrl = PreviewService.gerarPreview(anexo.url, anexo.tipo)
  const tipoPreview = PreviewService.obterTipoPreview(anexo.tipo)

  if (!previewUrl) {
    return (
      <Typography color="text.secondary">
        {ts('attachments.unsupportedPreview', { type: anexo.tipo })}
      </Typography>
    )
  }

  switch (tipoPreview) {
    case 'IMAGE':
      return (
        <Box
          component="img"
          src={previewUrl}
          sx={{
            maxWidth: '100%',
            maxHeight: 500,
            objectFit: 'contain',
          }}
        />
      )
    case 'VIDEO':
      return (
        <Box
          component="video"
          src={previewUrl}
          controls
          sx={{
            maxWidth: '100%',
            maxHeight: 500,
          }}
        />
      )
    case 'PDF':
    case 'SPREADSHEET':
    case 'DOCUMENT':
      return (
        <Box
          component="iframe"
          src={previewUrl}
          sx={{
            width: '100%',
            height: 500,
            border: 'none',
          }}
        />
      )
    default:
      return (
        <Typography color="text.secondary">
          {ts('attachments.noPreview')}
        </Typography>
      )
  }
}
