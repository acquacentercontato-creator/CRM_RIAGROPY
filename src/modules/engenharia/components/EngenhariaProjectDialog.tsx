import { zodResolver } from '@hookform/resolvers/zod'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { GlobalFileUpload } from '@/shared/components/GlobalFileUpload'
import { ENGENHARIA_TYPE_OPTIONS } from '@/modules/engenharia/models/engenhariaModels'
import { useEngenhariaDraft } from '@/modules/engenharia/hooks/useEngenhariaDraft'
import { EngenhariaService } from '@/modules/engenharia/services/EngenhariaService'
import type {
  EngenhariaProject,
  EngenhariaProjectForm,
  EngenhariaUploadCategory,
} from '@/modules/engenharia/types/engenhariaTypes'
import { ENGENHARIA_STATUS } from '@/modules/engenharia/types/engenhariaTypes'
import { createEmptyProjectForm } from '@/modules/engenharia/utils/engenhariaUtils'
import { engenhariaProjectSchema } from '@/modules/engenharia/validators/engenhariaValidators'
import { EngenhariaTimeline } from '@/modules/engenharia/components/EngenhariaTimeline'
import { WORKFLOW_TYPE_MAP } from '@/shared/workflow/WorkflowTypes'

type EngenhariaProjectDialogProps = {
  open: boolean
  editing: EngenhariaProject | null
  loading: boolean
  onClose: () => void
  onSubmit: (payload: EngenhariaProjectForm) => Promise<void>
  onUpload: (id: string, category: EngenhariaUploadCategory, files: File[]) => Promise<EngenhariaProject>
  onSaveMemorial: (id: string, memorial: string) => Promise<void>
  onApproval: (
    id: string,
    decision: 'APROVAR' | 'SOLICITAR_REVISAO',
    observacao: string
  ) => Promise<void>
}

export const EngenhariaProjectDialog = ({
  open,
  editing,
  loading,
  onClose,
  onSubmit,
  onUpload,
  onSaveMemorial,
  onApproval,
}: EngenhariaProjectDialogProps) => {
  const [tab, setTab] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [approvalNote, setApprovalNote] = useState('')

  const initial = useMemo<EngenhariaProjectForm>(() => {
    if (editing) {
      return {
        clienteNome: editing.clienteNome,
        titulo: editing.titulo,
        tipoProjeto: editing.tipoProjeto,
        origem: editing.origem,
        status: editing.status,
        memorialDescritivo: editing.memorialDescritivo,
        observacoes: editing.observacoes,
        plantaPdf: editing.plantaPdf,
        dwg: editing.dwg,
        dxf: editing.dxf,
        kmz: editing.kmz,
        fotos: editing.fotos,
        videos: editing.videos,
        materiais: editing.materiais,
      }
    }

    const draft = EngenhariaService.loadDraft()
    return draft ?? createEmptyProjectForm()
  }, [editing])

  const { control, reset, setValue, handleSubmit } = useForm<EngenhariaProjectForm>({
    resolver: zodResolver(engenhariaProjectSchema),
    defaultValues: initial,
  })

  const watchedValues = useWatch({ control }) as EngenhariaProjectForm
  useEngenhariaDraft(watchedValues, open && !editing)

  useEffect(() => {
    if (open) {
      reset(initial)
    }
  }, [open, initial, reset])

  const handleUpload = async (category: EngenhariaUploadCategory, files: File[]) => {
    if (!editing) {
      setFeedback('Salve o projeto antes de realizar uploads.')
      return
    }

    const updated = await onUpload(editing.id, category, files)
    setValue('plantaPdf', updated.plantaPdf)
    setValue('dwg', updated.dwg)
    setValue('dxf', updated.dxf)
    setValue('kmz', updated.kmz)
    setValue('fotos', updated.fotos)
    setValue('videos', updated.videos)
    setValue('materiais', updated.materiais)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>{editing ? `Projeto ${editing.codigoProjeto}` : 'Novo Projeto de Engenharia'}</DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 2 }}>
          <Tab label="Dados" />
          <Tab label="Arquivos" />
          <Tab label="Memorial" />
          <Tab label="Timeline" />
          <Tab label="Aprovacao" />
        </Tabs>

        {feedback && <Alert severity="info" sx={{ mb: 2 }}>{feedback}</Alert>}

        {tab === 0 && (
          <Stack spacing={2}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="clienteNome"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Cliente"
                      fullWidth
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="titulo"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Titulo do Projeto"
                      fullWidth
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="tipoProjeto"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Tipo" fullWidth>
                      {ENGENHARIA_TYPE_OPTIONS.map((typeCode) => (
                        <MenuItem key={typeCode} value={typeCode}>
                          {typeCode} - {WORKFLOW_TYPE_MAP[typeCode]}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="origem"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Origem" fullWidth>
                      <MenuItem value="RIEGO">RIEGO</MenuItem>
                      <MenuItem value="IMOTO">IMOTO</MenuItem>
                      <MenuItem value="OUTRO">OUTRO</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Status" fullWidth>
                      {ENGENHARIA_STATUS.map((status) => (
                        <MenuItem key={status} value={status}>
                          {status}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
            </Grid>

            <Controller
              name="observacoes"
              control={control}
              render={({ field }) => <TextField {...field} label="Observacoes" multiline minRows={3} fullWidth />}
            />
          </Stack>
        )}

        {tab === 1 && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <GlobalFileUpload
                title="Planta PDF"
                category="PDF"
                files={watchedValues.plantaPdf}
                onUpload={async (files) => handleUpload('PDF', files)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <GlobalFileUpload
                title="DWG"
                category="DWG"
                files={watchedValues.dwg}
                onUpload={async (files) => handleUpload('DWG', files)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <GlobalFileUpload
                title="DXF"
                category="DXF"
                files={watchedValues.dxf}
                onUpload={async (files) => handleUpload('DXF', files)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <GlobalFileUpload
                title="KMZ"
                category="KMZ"
                files={watchedValues.kmz}
                onUpload={async (files) => handleUpload('KMZ', files)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <GlobalFileUpload
                title="Fotos"
                category="FOTO"
                files={watchedValues.fotos}
                onUpload={async (files) => handleUpload('FOTO', files)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <GlobalFileUpload
                title="Videos"
                category="VIDEO"
                files={watchedValues.videos}
                onUpload={async (files) => handleUpload('VIDEO', files)}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <GlobalFileUpload
                title="Lista de materiais"
                category="OUTRO"
                files={watchedValues.materiais}
                onUpload={async (files) => handleUpload('OUTRO', files)}
              />
            </Grid>
          </Grid>
        )}

        {tab === 2 && (
          <Stack spacing={2}>
            <Controller
              name="memorialDescritivo"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Memorial Descritivo" multiline minRows={8} fullWidth />
              )}
            />
            {editing && (
              <Button
                variant="outlined"
                onClick={async () => {
                  await onSaveMemorial(editing.id, watchedValues.memorialDescritivo)
                  setFeedback('Memorial atualizado com sucesso.')
                }}
              >
                Atualizar memorial
              </Button>
            )}
          </Stack>
        )}

        {tab === 3 && <EngenhariaTimeline events={editing?.timeline ?? []} />}

        {tab === 4 && (
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Aprovacao do gerente para liberar o projeto completo ou solicitar revisao.
            </Typography>
            <TextField
              label="Observacao"
              value={approvalNote}
              onChange={(event) => setApprovalNote(event.target.value)}
              multiline
              minRows={3}
              fullWidth
            />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
              <Button
                variant="contained"
                disabled={!editing}
                onClick={async () => {
                  if (!editing) return
                  await onApproval(editing.id, 'APROVAR', approvalNote)
                  setFeedback('Projeto aprovado pelo gerente.')
                }}
              >
                Aprovar
              </Button>
              <Button
                variant="outlined"
                color="warning"
                disabled={!editing}
                onClick={async () => {
                  if (!editing) return
                  await onApproval(editing.id, 'SOLICITAR_REVISAO', approvalNote)
                  setFeedback('Revisao solicitada pelo gerente.')
                }}
              >
                Solicitar revisao
              </Button>
            </Stack>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" disabled={loading} onClick={handleSubmit(onSubmit)}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
