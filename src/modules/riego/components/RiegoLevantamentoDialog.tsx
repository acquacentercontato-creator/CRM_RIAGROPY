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
import {
  RIEGO_SEGMENTS,
  RIEGO_STATUS,
  type RiegoLevantamento,
  type RiegoLevantamentoForm,
  type RiegoMediaItem,
  type RiegoMediaType,
  type RiegoSegment,
} from '@/modules/riego/types/riegoTypes'
import { riegoLevantamentoSchema } from '@/modules/riego/validators/riegoValidators'
import { createEmptyLevantamentoForm, createEmptyQuestionnaire } from '@/modules/riego/utils/riegoUtils'
import { RIEGO_SEGMENT_LABELS } from '@/modules/riego/models/riegoModels'
import { RiegoService } from '@/modules/riego/services/RiegoService'
import { RiegoMediaUploader } from './RiegoMediaUploader'
import { RiegoSegmentForm } from './RiegoSegmentForm'
import { RiegoTimeline } from './RiegoTimeline'
import { useRiegoDraft } from '@/modules/riego/hooks/useRiegoDraft'
import { useRiegoGps } from '@/modules/riego/hooks/useRiegoGps'

type RiegoLevantamentoDialogProps = {
  open: boolean
  editing: RiegoLevantamento | null
  loading: boolean
  onClose: () => void
  onSubmit: (payload: RiegoLevantamentoForm) => Promise<void>
  onUpload: (files: File[], type: RiegoMediaType) => Promise<RiegoMediaItem[]>
}

export const RiegoLevantamentoDialog = ({
  open,
  editing,
  loading,
  onClose,
  onSubmit,
  onUpload,
}: RiegoLevantamentoDialogProps) => {
  const [tab, setTab] = useState(0)
  const [gpsError, setGpsError] = useState('')
  const { capturing, capture } = useRiegoGps()

  const initial = useMemo<RiegoLevantamentoForm>(() => {
    if (editing) {
      return {
        clienteNome: editing.clienteNome,
        propriedade: editing.propriedade,
        responsavel: editing.responsavel,
        segmento: editing.segmento,
        status: editing.status,
        observacoes: editing.observacoes,
        gpsLat: editing.gpsLat,
        gpsLng: editing.gpsLng,
        questionnaire: editing.questionnaire,
        fotos: editing.fotos,
        videos: editing.videos,
        documentos: editing.documentos,
      }
    }

    const draft = RiegoService.loadDraft()
    return draft ?? createEmptyLevantamentoForm()
  }, [editing])

  const { control, reset, setValue, handleSubmit, formState } = useForm<RiegoLevantamentoForm>({
    resolver: zodResolver(riegoLevantamentoSchema),
    defaultValues: initial,
  })

  const watchedValues = useWatch({ control }) as RiegoLevantamentoForm
  useRiegoDraft(watchedValues, open && !editing)

  useEffect(() => {
    if (open) {
      reset(initial)
    }
  }, [open, initial, reset])

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>{editing ? 'Editar levantamento RIEGO' : 'Novo levantamento RIEGO'}</DialogTitle>
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
                  name="propriedade"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Propriedade"
                      fullWidth
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="responsavel"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Responsavel"
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
                        const value = event.target.value as RiegoSegment
                        field.onChange(value)
                        setValue('questionnaire', createEmptyQuestionnaire(value))
                      }}
                    >
                      {RIEGO_SEGMENTS.map((segment) => (
                        <MenuItem key={segment} value={segment}>
                          {RIEGO_SEGMENT_LABELS[segment]}
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
                      {RIEGO_STATUS.map((status) => (
                        <MenuItem key={status} value={status}>
                          {status}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
            </Grid>

            <RiegoSegmentForm segment={watchedValues.segmento} control={control} errors={formState.errors} />

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
                      setValue('gpsLat', coords.lat)
                      setValue('gpsLng', coords.lng)
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
                <RiegoMediaUploader
                  title="Fotos"
                  type="FOTO"
                  items={watchedValues.fotos}
                  onUpload={async (files, type) => {
                    const uploaded = await onUpload(files, type)
                    setValue('fotos', [...uploaded, ...watchedValues.fotos])
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <RiegoMediaUploader
                  title="Videos"
                  type="VIDEO"
                  items={watchedValues.videos}
                  onUpload={async (files, type) => {
                    const uploaded = await onUpload(files, type)
                    setValue('videos', [...uploaded, ...watchedValues.videos])
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <RiegoMediaUploader
                  title="Documentos"
                  type="DOCUMENTO"
                  items={watchedValues.documentos}
                  onUpload={async (files, type) => {
                    const uploaded = await onUpload(files, type)
                    setValue('documentos', [...uploaded, ...watchedValues.documentos])
                  }}
                />
              </Grid>
            </Grid>

            {!editing && <Alert severity="info">Salvamento automatico ativado para rascunho.</Alert>}
          </Stack>
        )}

        {tab === 1 && <RiegoTimeline events={editing?.timeline ?? []} />}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          disabled={loading}
          onClick={handleSubmit(async (payload) => {
            await onSubmit(payload)
            RiegoService.clearDraft()
            onClose()
          })}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
