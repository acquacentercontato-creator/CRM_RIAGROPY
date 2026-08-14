import { zodResolver } from '@hookform/resolvers/zod'
import {
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
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { ModuleAttachmentsTab } from '@/shared/attachments/components/ModuleAttachmentsTab'
import { ECOLIFE_QUESTIONS } from '@/modules/ecolife/models/ecolifeModels'
import {
  ECOLIFE_STATUS,
  type EcolifeDiagnostic,
  type EcolifeDiagnosticForm,
  type EcolifeProduct,
} from '@/modules/ecolife/types/ecolifeTypes'
import { ecolifeDiagnosticSchema } from '@/modules/ecolife/validators/ecolifeValidators'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

const emptyForm = (product: EcolifeProduct): EcolifeDiagnosticForm => ({
  product,
  propertyName: '',
  municipality: '',
  department: '',
  status: 'LEVANTAMENTO',
  expectedRevenue: 0,
  answers: Object.fromEntries(ECOLIFE_QUESTIONS[product].map((key) => [key, ''])),
  observations: '',
})

export const EcolifeDiagnosticDialog = ({
  open,
  product,
  editing,
  onClose,
  onSave,
}: {
  open: boolean
  product: EcolifeProduct
  editing: EcolifeDiagnostic | null
  onClose: () => void
  onSave: (form: EcolifeDiagnosticForm) => Promise<void>
}) => {
  const ts = useTranslationService()
  const [tab, setTab] = useState(0)
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EcolifeDiagnosticForm>({
    resolver: zodResolver(ecolifeDiagnosticSchema),
    defaultValues: emptyForm(product),
  })
  useEffect(() => {
    if (open)
      reset(
        editing
          ? {
              product: editing.product,
              propertyName: editing.propertyName,
              municipality: editing.municipality,
              department: editing.department,
              status: editing.status,
              expectedRevenue: editing.expectedRevenue,
              answers: editing.answers,
              observations: editing.observations,
            }
          : emptyForm(product)
      )
  }, [editing, open, product, reset])
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{ts(editing ? 'ecolife.actions.edit' : 'ecolife.actions.new')}</DialogTitle>
      <Tabs value={tab} onChange={(_, value: number) => setTab(value)} variant="scrollable">
        <Tab label={ts('ecolife.tabs.data')} />
        <Tab label={ts('ecolife.tabs.questionnaire')} />
        <Tab label={ts('ecolife.tabs.timeline')} />
        <Tab label={ts('ecolife.tabs.attachments')} />
      </Tabs>
      <DialogContent dividers>
        {tab === 0 && (
          <Grid container spacing={2}>
            {(['propertyName', 'municipality', 'department'] as const).map((name) => (
              <Grid key={name} size={{ xs: 12, md: 6 }}>
                <Controller
                  name={name}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={ts(`ecolife.fields.${name}`)}
                      error={Boolean(errors[name])}
                      helperText={errors[name] ? ts(String(errors[name]?.message)) : ''}
                    />
                  )}
                />
              </Grid>
            ))}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select fullWidth label={ts('ecolife.fields.status')}>
                    {ECOLIFE_STATUS.map((status) => (
                      <MenuItem key={status} value={status}>
                        {ts(`ecolife.status.${status}`)}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="expectedRevenue"
                control={control}
                render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  fullWidth
                  label={ts('ecolife.fields.expectedRevenue')}
                  onChange={(event) => field.onChange(Number(event.target.value))}
                />
                )}
              />
            </Grid>
            <Grid size={12}>
              <Controller
                name="observations"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    minRows={3}
                    label={ts('ecolife.fields.observations')}
                  />
                )}
              />
            </Grid>
          </Grid>
        )}
        {tab === 1 && (
          <Stack spacing={2}>
            {ECOLIFE_QUESTIONS[editing?.product || product].map((key) => (
              <Controller
                key={key}
                name={`answers.${key}`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    label={ts(`ecolife.questions.${key}`)}
                  />
                )}
              />
            ))}
          </Stack>
        )}
        {tab === 2 &&
          (editing ? (
            <Stack spacing={1}>
              {editing.timeline.map((event) => (
                <Typography key={event.id}>
                  {ts(`ecolife.status.${event.status}`)} ·{' '}
                  {new Date(event.createdAt).toLocaleString(ts('ecolife.locale'))} ·{' '}
                  {event.actorName}
                </Typography>
              ))}
            </Stack>
          ) : (
            <Typography color="text.secondary">{ts('ecolife.timeline.saveFirst')}</Typography>
          ))}
        {tab === 3 && (
          <ModuleAttachmentsTab
            entityId={editing?.id || ''}
            entityNome={editing?.propertyName || ''}
            moduloContext="ECOLIFE"
            projetoId={editing?.id}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{ts('actions.cancel')}</Button>
        <Button variant="contained" disabled={isSubmitting} onClick={handleSubmit(onSave)}>
          {ts('actions.save')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
