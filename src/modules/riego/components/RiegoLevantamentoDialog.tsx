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
import { useTranslationService } from '@/shared/hooks/useTranslationService'
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
import { RiegoService } from '@/modules/riego/services/RiegoService'
import { RiegoMediaUploader } from './RiegoMediaUploader'
import { RiegoSegmentForm } from './RiegoSegmentForm'
import { RiegoTimeline } from './RiegoTimeline'
import { useRiegoDraft } from '@/modules/riego/hooks/useRiegoDraft'
import { useRiegoGps } from '@/modules/riego/hooks/useRiegoGps'
import { ModuleAttachmentsTab } from '@/shared/attachments'

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
  const ts = useTranslationService()
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
      <DialogTitle>{editing ? ts('riego.editSurvey') : ts('riego.newSurvey')}</DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 2 }}>
          <Tab label={ts('riego.tabs.dados')} />
          <Tab label={ts('riego.tabs.timeline')} />
          <Tab label={ts('attachments.tab')} disabled={!editing} />
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
                      label={ts('riego.fields.cliente')}
                      fullWidth
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message ? ts(fieldState.error.message) : undefined}
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
                      label={ts('riego.fields.propriedade')}
                      fullWidth
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message ? ts(fieldState.error.message) : undefined}
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
                      label={ts('riego.fields.responsavel')}
                      fullWidth
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message ? ts(fieldState.error.message) : undefined}
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
                      label={ts('riego.fields.segmento')}
                      fullWidth
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message ? ts(fieldState.error.message) : undefined}
                      onChange={(event) => {
                        const value = event.target.value as RiegoSegment
                        field.onChange(value)
                        setValue('questionnaire', createEmptyQuestionnaire(value))
                      }}
                    >
                      {RIEGO_SEGMENTS.map((segment) => (
                        <MenuItem key={segment} value={segment}>
                          {ts(`riego.segments.${segment}`)}
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
                      label={ts('riego.fields.status')}
                      fullWidth
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message ? ts(fieldState.error.message) : undefined}
                    >
                      {RIEGO_STATUS.map((status) => (
                        <MenuItem key={status} value={status}>
                          {ts(`riego.status.${status}`)}
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
                  render={({ field }) => <TextField {...field} label={ts('riego.fields.gpsLat')} fullWidth />}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <Controller
                  name="gpsLng"
                  control={control}
                  render={({ field }) => <TextField {...field} label={ts('riego.fields.gpsLng')} fullWidth />}
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
                  {capturing ? ts('riego.gps.capturing') : ts('riego.gps.capture')}
                </Button>
              </Grid>
            </Grid>

            {gpsError && <Alert severity="warning">{gpsError}</Alert>}

            <Controller
              name="observacoes"
              control={control}
              render={({ field }) => <TextField {...field} label={ts('riego.fields.observacoes')} multiline minRows={3} fullWidth />}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <RiegoMediaUploader
                  title={ts('engenharia.uploads.fotos')}
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
                  title={ts('engenharia.uploads.videos')}
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
                  title={ts('riego.fields.documentos')}
                  type="DOCUMENTO"
                  items={watchedValues.documentos}
                  onUpload={async (files, type) => {
                    const uploaded = await onUpload(files, type)
                    setValue('documentos', [...uploaded, ...watchedValues.documentos])
                  }}
                />
              </Grid>
            </Grid>

            {!editing && <Alert severity="info">{ts('riego.autoDraft')}</Alert>}
          </Stack>
        )}

        {tab === 1 && <RiegoTimeline events={editing?.timeline ?? []} />}

        {tab === 2 && (
          <ModuleAttachmentsTab
            entityId={editing?.id ?? ''}
            entityNome={editing?.clienteNome ?? ''}
            moduloContext="ENGENHARIA"
            projetoId={editing?.id}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{ts('actions.cancel')}</Button>
        <Button
          variant="contained"
          disabled={loading}
          onClick={handleSubmit(async (payload) => {
            await onSubmit(payload)
            RiegoService.clearDraft()
            onClose()
          })}
        >
          {ts('actions.save')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
