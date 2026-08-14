import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { ModuleAttachmentsTab } from '@/shared/attachments/components/ModuleAttachmentsTab'
import { useClientes } from '@/modules/comercial/hooks/useComercialData'
import { ECOLIFE_QUESTIONS, ECOLIFE_QUESTION_SECTIONS } from '@/modules/ecolife/models/ecolifeModels'
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
  clientId: '',
  clientName: '',
  municipality: '',
  department: '',
  consultantName: '',
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
  onAttachmentUploaded,
}: {
  open: boolean
  product: EcolifeProduct
  editing: EcolifeDiagnostic | null
  onClose: () => void
  onSave: (form: EcolifeDiagnosticForm) => Promise<void>
  onAttachmentUploaded: (item: EcolifeDiagnostic) => void
}) => {
  const ts = useTranslationService()
  const { data: clients = [] } = useClientes()
  const [tab, setTab] = useState(0)
  const {
    control,
    handleSubmit,
    reset,
    setValue,
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
              clientId: editing.clientId || '',
              clientName: editing.clientName || '',
              propertyName: editing.propertyName,
              municipality: editing.municipality,
              department: editing.department,
              consultantName: editing.consultantName || '',
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
            <Grid size={12}>
              <Controller
                name="clientId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label={ts('ecolife.fields.client')}
                    error={Boolean(errors.clientId)}
                    helperText={errors.clientId ? ts(String(errors.clientId.message)) : ''}
                    onChange={(event) => {
                      field.onChange(event)
                      const client = clients.find((item) => item.id === event.target.value)
                      if (!client) return
                      const clientName = client.nomeFantasia || client.razaoSocial
                      setValue('clientName', clientName)
                      setValue('propertyName', clientName)
                      setValue('municipality', client.cidade)
                      setValue('department', client.departamento)
                    }}
                  >
                    {clients.map((client) => (
                      <MenuItem key={client.id} value={client.id}>
                        {client.nomeFantasia || client.razaoSocial}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            {(['propertyName', 'municipality', 'department', 'consultantName'] as const).map((name) => (
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
            <Grid size={12}>
              <Stepper activeStep={ECOLIFE_STATUS.indexOf(editing?.status || 'LEVANTAMENTO')} alternativeLabel>
                {ECOLIFE_STATUS.map((status) => <Step key={status}><StepLabel>{ts(`ecolife.status.${status}`)}</StepLabel></Step>)}
              </Stepper>
            </Grid>
          </Grid>
        )}
        {tab === 1 && (
          <Stack spacing={2}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6">{ts('ecolife.sections.property')}</Typography>
              <Typography color="text.secondary">{ts(`ecolife.products.${editing?.product || product}`)}</Typography>
            </Paper>
            {ECOLIFE_QUESTION_SECTIONS[editing?.product || product].map((section) => (
              <Paper key={section.key} variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>{ts(`ecolife.sections.${section.key}`)}</Typography>
                <Grid container spacing={2}>
                  {section.questions.map((key) => (
                    <Grid key={key} size={{ xs: 12, md: 6 }}>
                      <Controller name={`answers.${key}`} control={control} render={({ field }) => (
                        <TextField {...field} fullWidth multiline minRows={2} label={ts(`ecolife.questions.${key}`)} />
                      )} />
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            ))}
          </Stack>
        )}
        {tab === 2 &&
          (editing ? (
            <Stack spacing={1}>
              {editing.timeline.map((event) => (
                <Typography key={event.id}>
                  {ts(`ecolife.timeline.actions.${event.action || 'CREATED'}`)} · {ts(`ecolife.status.${event.status}`)} ·{' '}
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
            entityId={editing?.clientId || ''}
            entityNome={editing?.clientName || editing?.propertyName || ''}
            moduloContext="ECOLIFE"
            projetoId={editing?.id}
            onUploadComplete={() => editing && onAttachmentUploaded(editing)}
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
