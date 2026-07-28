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
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { GlobalFileUpload } from '@/shared/components/GlobalFileUpload'
import { IMOTO_MEDIA_KEYS, IMOTO_SEGMENT_LABELS } from '@/modules/imoto/models/imotoModels'
import { useImotoDraft } from '@/modules/imoto/hooks/useImotoDraft'
import { useImotoGps } from '@/modules/imoto/hooks/useImotoGps'
import { ImotoService } from '@/modules/imoto/services/ImotoService'
import type {
  ImotoLevantamento,
  ImotoLevantamentoForm,
  ImotoUploadedFile,
  ImotoUploadCategory,
} from '@/modules/imoto/types/imotoTypes'
import { IMOTO_SEGMENTS, IMOTO_STATUS } from '@/modules/imoto/types/imotoTypes'
import { createEmptyLevantamentoForm, createEmptyQuestionnaire } from '@/modules/imoto/utils/imotoUtils'
import { imotoLevantamentoSchema } from '@/modules/imoto/validators/imotoValidators'
import { ImotoSegmentForm } from '@/modules/imoto/components/ImotoSegmentForm'
import { ImotoTimeline } from '@/modules/imoto/components/ImotoTimeline'

type ImotoLevantamentoDialogProps = {
  open: boolean
  editing: ImotoLevantamento | null
  loading: boolean
  onClose: () => void
  onSubmit: (payload: ImotoLevantamentoForm) => Promise<void>
  onUpload: (
    files: File[],
    category: ImotoUploadCategory,
    segment: ImotoLevantamento['segmento']
  ) => Promise<ImotoLevantamentoForm['fotos']>
}

export const ImotoLevantamentoDialog = ({
  open,
  editing,
  loading,
  onClose,
  onSubmit,
  onUpload,
}: ImotoLevantamentoDialogProps) => {
  const [tab, setTab] = useState(0)
  const [gpsError, setGpsError] = useState('')
  const { capturing, capture } = useImotoGps()

  const initial = useMemo<ImotoLevantamentoForm>(() => {
    if (editing) {
      return {
        clienteNome: editing.clienteNome,
        unidadeIndustrial: editing.unidadeIndustrial,
        responsavelTecnico: editing.responsavelTecnico,
        segmento: editing.segmento,
        status: editing.status,
        observacoes: editing.observacoes,
        gpsLat: editing.gpsLat,
        gpsLng: editing.gpsLng,
        questionnaire: editing.questionnaire,
        fotos: editing.fotos,
        videos: editing.videos,
        pdfs: editing.pdfs,
        dwgs: editing.dwgs,
        dxfs: editing.dxfs,
        kmzs: editing.kmzs,
      }
    }

    const draft = ImotoService.loadDraft()
    return draft ?? createEmptyLevantamentoForm()
  }, [editing])

  const { control, reset, setValue, handleSubmit, formState } = useForm<ImotoLevantamentoForm>({
    resolver: zodResolver(imotoLevantamentoSchema),
    defaultValues: initial,
  })

  const watchedValues = useWatch({ control }) as ImotoLevantamentoForm
  useImotoDraft(watchedValues, open && !editing)

  useEffect(() => {
    if (open) {
      reset(initial)
    }
  }, [open, initial, reset])

  const appendFiles = (
    key: 'fotos' | 'videos' | 'pdfs' | 'dwgs' | 'dxfs' | 'kmzs',
    uploaded: ImotoUploadedFile[]
  ) => {
    const current = watchedValues[key] as ImotoUploadedFile[]
    setValue(key, [...uploaded, ...current], { shouldDirty: true })
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>{editing ? 'Editar levantamento IMOTO' : 'Novo levantamento IMOTO'}</DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 2 }}>
          <Tab label="Dados" />
          <Tab label="Timeline" />
        </Tabs>

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
                  name="unidadeIndustrial"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Unidade Industrial"
                      fullWidth
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="responsavelTecnico"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Responsavel Tecnico"
                      fullWidth
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="segmento"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      select
                      label="Segmento"
                      fullWidth
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message}
                      onChange={(event) => {
                        const value = event.target.value as ImotoLevantamento['segmento']
                        field.onChange(value)
                        setValue('questionnaire', createEmptyQuestionnaire(value), { shouldDirty: true })
                      }}
                    >
                      {IMOTO_SEGMENTS.map((segment) => (
                        <MenuItem key={segment} value={segment}>
                          {IMOTO_SEGMENT_LABELS[segment]}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      select
                      label="Status"
                      fullWidth
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message}
                    >
                      {IMOTO_STATUS.map((status) => (
                        <MenuItem key={status} value={status}>
                          {status}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
            </Grid>

            <ImotoSegmentForm segment={watchedValues.segmento} control={control} errors={formState.errors} />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 5 }}>
                <Controller
                  name="gpsLat"
                  control={control}
                  render={({ field }) => <TextField {...field} label="GPS Latitude" fullWidth />}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <Controller
                  name="gpsLng"
                  control={control}
                  render={({ field }) => <TextField {...field} label="GPS Longitude" fullWidth />}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={async () => {
                    setGpsError('')
                    try {
                      const coords = await capture()
                      setValue('gpsLat', coords.lat, { shouldDirty: true })
                      setValue('gpsLng', coords.lng, { shouldDirty: true })
                    } catch (error) {
                      setGpsError((error as Error).message)
                    }
                  }}
                  disabled={capturing}
                >
                  {capturing ? 'Capturando...' : 'GPS'}
                </Button>
              </Grid>
            </Grid>

            {gpsError && <Alert severity="warning">{gpsError}</Alert>}

            <Controller
              name="observacoes"
              control={control}
              render={({ field }) => <TextField {...field} label="Observacoes" multiline minRows={3} fullWidth />}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <GlobalFileUpload
                  title="Fotos"
                  category="FOTO"
                  files={watchedValues.fotos}
                  onUpload={async (files) => {
                    const uploaded = await onUpload(files, 'FOTO', watchedValues.segmento)
                    appendFiles(IMOTO_MEDIA_KEYS.FOTO, uploaded)
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <GlobalFileUpload
                  title="Videos"
                  category="VIDEO"
                  files={watchedValues.videos}
                  onUpload={async (files) => {
                    const uploaded = await onUpload(files, 'VIDEO', watchedValues.segmento)
                    appendFiles(IMOTO_MEDIA_KEYS.VIDEO, uploaded)
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <GlobalFileUpload
                  title="PDFs"
                  category="PDF"
                  files={watchedValues.pdfs}
                  onUpload={async (files) => {
                    const uploaded = await onUpload(files, 'PDF', watchedValues.segmento)
                    appendFiles(IMOTO_MEDIA_KEYS.PDF, uploaded)
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <GlobalFileUpload
                  title="DWG"
                  category="DWG"
                  files={watchedValues.dwgs}
                  onUpload={async (files) => {
                    const uploaded = await onUpload(files, 'DWG', watchedValues.segmento)
                    appendFiles(IMOTO_MEDIA_KEYS.DWG, uploaded)
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <GlobalFileUpload
                  title="DXF"
                  category="DXF"
                  files={watchedValues.dxfs}
                  onUpload={async (files) => {
                    const uploaded = await onUpload(files, 'DXF', watchedValues.segmento)
                    appendFiles(IMOTO_MEDIA_KEYS.DXF, uploaded)
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <GlobalFileUpload
                  title="KMZ"
                  category="KMZ"
                  files={watchedValues.kmzs}
                  onUpload={async (files) => {
                    const uploaded = await onUpload(files, 'KMZ', watchedValues.segmento)
                    appendFiles(IMOTO_MEDIA_KEYS.KMZ, uploaded)
                  }}
                />
              </Grid>
            </Grid>
          </Stack>
        )}

        {tab === 1 && <ImotoTimeline events={editing?.timeline ?? []} />}
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
