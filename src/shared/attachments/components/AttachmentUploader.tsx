/**
 * Componente para upload centralizado de anexos
 */

import { useState, useRef } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  Tooltip,
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import { AttachmentService, PreviewService, type AttachmentCategory, type ModuleContext, type AttachmentType } from '@/shared/attachments'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

interface UploadFile {
  file: File
  nome: string
  tipo: AttachmentType | null
  categoria: AttachmentCategory | 'OUTRO'
  observacoes?: string
  tags?: string[]
  status: 'PENDENTE' | 'ENVIANDO' | 'SUCESSO' | 'ERRO'
  progresso: number
  mensagem?: string
}

interface AttachmentUploaderProps {
  open: boolean
  clienteId: string
  clienteNome: string
  projetoId?: string
  moduloContext: ModuleContext
  onClose: () => void
  onUploadCompleto?: () => void
}

export const AttachmentUploader = ({
  open,
  clienteId,
  clienteNome,
  projetoId,
  moduloContext,
  onClose,
  onUploadCompleto,
}: AttachmentUploaderProps) => {
  const ts = useTranslationService()
  const [arquivos, setArquivos] = useState<UploadFile[]>([])
  const [categoriaPadrao, setCategoriaPadrao] = useState<AttachmentCategory>('DOCUMENTACAO')
  const [observacoesPadrao, setObservacoesPadrao] = useState('')
  const [uploading, setUploading] = useState(false)
  const [erros, setErros] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const novosArquivos: UploadFile[] = files.map((file) => ({
      file,
      nome: file.name.replace(/\.[^/.]+$/, ''), // Remove extensão
      tipo: PreviewService.detectarTipo(file.name),
      categoria: categoriaPadrao,
      observacoes: observacoesPadrao,
      tags: [],
      status: 'PENDENTE',
      progresso: 0,
    }))
    setArquivos([...arquivos, ...novosArquivos])
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const files = Array.from(event.dataTransfer.files)
    const novosArquivos: UploadFile[] = files.map((file) => ({
      file,
      nome: file.name.replace(/\.[^/.]+$/, ''),
      tipo: PreviewService.detectarTipo(file.name),
      categoria: categoriaPadrao,
      observacoes: observacoesPadrao,
      tags: [],
      status: 'PENDENTE',
      progresso: 0,
    }))
    setArquivos([...arquivos, ...novosArquivos])
  }

  const handleRemoveArquivo = (index: number) => {
    setArquivos(arquivos.filter((_, i) => i !== index))
  }

  const handleAtualizarArquivo = (index: number, atualizacoes: Partial<UploadFile>) => {
    const novosCobrar = [...arquivos]
    novosCobrar[index] = { ...novosCobrar[index], ...atualizacoes }
    setArquivos(novosCobrar)
  }

  const validarArquivos = (): boolean => {
    const novosErros: string[] = []

    arquivos.forEach((arquivo, index) => {
      if (!arquivo.tipo) {
        novosErros.push(ts('attachments.uploader.unknownType', { index: index + 1 }))
      }
      if (!arquivo.nome.trim()) {
        novosErros.push(ts('attachments.uploader.emptyName', { index: index + 1 }))
      }
      if (arquivo.file.size > 500 * 1024 * 1024) {
        novosErros.push(
          ts('attachments.uploader.tooLarge', { index: index + 1 })
        )
      }
    })

    setErros(novosErros)
    return novosErros.length === 0
  }

  const handleUpload = async () => {
    if (!validarArquivos()) return

    setUploading(true)
    let sucessos = 0
    let falhas = 0

    for (let i = 0; i < arquivos.length; i++) {
      const arquivo = arquivos[i]

      if (!arquivo.tipo) {
        handleAtualizarArquivo(i, {
          status: 'ERRO',
          mensagem: ts('attachments.uploader.unsupportedType'),
        })
        falhas++
        continue
      }

      handleAtualizarArquivo(i, { status: 'ENVIANDO', progresso: 0 })

      try {
        // Simular progresso
        const intervalo = setInterval(() => {
          setArquivos((prev) => {
            const updated = [...prev]
            if (updated[i].progresso < 90) {
              updated[i].progresso += Math.random() * 30
            }
            return updated
          })
        }, 200)

        await AttachmentService.upload({
          arquivo: arquivo.file,
          nome: arquivo.nome,
          tipo: arquivo.tipo,
          categoria: arquivo.categoria,
          clienteId,
          clienteNome,
          projetoId,
          moduloContext,
          observacoes: arquivo.observacoes,
          tags: arquivo.tags,
        })

        clearInterval(intervalo)

        handleAtualizarArquivo(i, {
          status: 'SUCESSO',
          progresso: 100,
          mensagem: ts('attachments.uploader.success'),
        })

        sucessos++
      } catch (error) {
        handleAtualizarArquivo(i, {
          status: 'ERRO',
          progresso: 0,
          mensagem: error instanceof Error ? error.message : ts('attachments.uploader.uploadError'),
        })
        falhas++
      }
    }

    setUploading(false)

    if (sucessos > 0 && onUploadCompleto) {
      onUploadCompleto()
    }

    if (falhas === 0) {
      setTimeout(() => {
        handleFechar()
      }, 1500)
    }
  }

  const handleFechar = () => {
    setArquivos([])
    setErros([])
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleFechar} maxWidth="sm" fullWidth>
      <DialogTitle>{ts('attachments.uploader.title')}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Exibir erros */}
        {erros.length > 0 && (
          <Alert severity="error">
            <Typography variant="subtitle2">{ts('attachments.uploader.validationErrors')}</Typography>
            <ul>
              {erros.map((erro, i) => (
                <li key={i}>{erro}</li>
              ))}
            </ul>
          </Alert>
        )}

        {/* Drop Zone */}
        <Box
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          sx={{
            border: '2px dashed #ccc',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'action.hover',
            },
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h6">{ts('attachments.uploader.dropHere')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {ts('attachments.uploader.clickToSelect')}
          </Typography>
          <input
            ref={fileInputRef}
            hidden
            type="file"
            multiple
            onChange={handleFileSelect}
            accept=".pdf,.jpg,.jpeg,.png,.heic,.docx,.xlsx,.dwg,.dxf,.kmz,.kml,.zip,.mp4"
          />
        </Box>

        {/* Configurações padrão */}
        {arquivos.length === 0 && (
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel>{ts('attachments.uploader.defaultCategory')}</InputLabel>
              <Select
                value={categoriaPadrao}
                onChange={(e) => setCategoriaPadrao(e.target.value as AttachmentCategory)}
                label={ts('attachments.uploader.defaultCategory')}
              >
                <MenuItem value="DOCUMENTACAO">{ts('attachments.categories.DOCUMENTACAO')}</MenuItem>
                <MenuItem value="MIDIA">{ts('attachments.categories.MIDIA')}</MenuItem>
                <MenuItem value="TECNICO">{ts('attachments.categories.TECNICO')}</MenuItem>
                <MenuItem value="FINANCEIRO">{ts('attachments.categories.FINANCEIRO')}</MenuItem>
                <MenuItem value="ADMINISTRATIVO">{ts('attachments.categories.ADMINISTRATIVO')}</MenuItem>
                <MenuItem value="OUTRO">{ts('attachments.categories.OUTRO')}</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={2}
              label={ts('attachments.uploader.defaultNotes')}
              placeholder={ts('attachments.uploader.defaultNotesPlaceholder')}
              value={observacoesPadrao}
              onChange={(e) => setObservacoesPadrao(e.target.value)}
            />
          </Stack>
        )}

        {/* Lista de arquivos */}
        {arquivos.length > 0 && (
          <List sx={{ maxHeight: 300, overflow: 'auto' }}>
            {arquivos.map((arquivo, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <Tooltip title={ts('actions.remove')}>
                    <Button
                      size="small"
                      onClick={() => handleRemoveArquivo(index)}
                      disabled={arquivo.status === 'ENVIANDO'}
                    >
                      {ts('actions.remove')}
                    </Button>
                  </Tooltip>
                }
                sx={{ py: 1 }}
              >
                <ListItemIcon>
                  {arquivo.status === 'SUCESSO' && (
                    <CheckCircleIcon sx={{ color: 'success.main' }} />
                  )}
                  {arquivo.status === 'ERRO' && (
                    <ErrorIcon sx={{ color: 'error.main' }} />
                  )}
                  {(arquivo.status === 'PENDENTE' || arquivo.status === 'ENVIANDO') && (
                    <Typography sx={{ fontSize: 20 }}>
                      {PreviewService.obterIcone(arquivo.tipo || 'PDF')}
                    </Typography>
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <TextField
                        size="small"
                        value={arquivo.nome}
                        onChange={(e) => handleAtualizarArquivo(index, { nome: e.target.value })}
                        disabled={arquivo.status !== 'PENDENTE'}
                        sx={{ flex: 1, maxWidth: 200 }}
                      />
                      {arquivo.tipo && (
                        <Chip
                          label={arquivo.tipo}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  }
                  secondary={
                    <Stack spacing={0.5} sx={{ mt: 1 }}>
                      {arquivo.progresso > 0 && arquivo.status === 'ENVIANDO' && (
                        <LinearProgress
                          variant="determinate"
                          value={arquivo.progresso}
                          sx={{ height: 4 }}
                        />
                      )}
                      {arquivo.mensagem && (
                        <Typography
                          variant="caption"
                          color={arquivo.status === 'ERRO' ? 'error' : 'text.secondary'}
                        >
                          {arquivo.mensagem}
                        </Typography>
                      )}
                    </Stack>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleFechar} disabled={uploading}>
          {ts('actions.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={arquivos.length === 0 || uploading}
        >
          {uploading ? ts('attachments.uploader.uploading') : ts('actions.upload')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
