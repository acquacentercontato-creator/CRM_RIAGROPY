import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Paper,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { visitaSchema, type VisitaFormInput } from '@/modules/comercial/validators/comercialValidators'
import { useClientes, useVisitaMutations, useVisitas } from '@/modules/comercial/hooks/useComercialData'
import type { Visita } from '@/modules/comercial/types'
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog'
import { CrudSectionHeader } from './CrudSectionHeader'
import { useAuth } from '@/auth/AuthContext'
import { PermissionService } from '@/shared/auth/PermissionService'
import { ModuleAttachmentsTab } from '@/shared/attachments'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

const emptyValues: VisitaFormInput = {
  data: '',
  hora: '',
  clienteId: '',
  clienteNome: '',
  responsavel: '',
  objetivo: '',
  resultado: '',
  fotos: [],
  videos: [],
  audios: [],
  gpsLat: '',
  gpsLng: '',
  observacoes: '',
}

const splitMedia = (raw: string) =>
  raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

const joinMedia = (value: string[]) => value.join(', ')

export const VisitasCrud = () => {
  const { data: visitas = [], isLoading } = useVisitas()
  const { data: clientes = [] } = useClientes()
  const { createVisita, updateVisita, deleteVisita } = useVisitaMutations()
  const { user } = useAuth()
  const ts = useTranslationService()

  const canEdit = PermissionService.canEdit(user?.role)
  const canDelete = PermissionService.canDelete(user?.role)

  const [open, setOpen] = useState(false)
  const [dialogTab, setDialogTab] = useState(0)
  const [editing, setEditing] = useState<Visita | null>(null)
  const [removeTarget, setRemoveTarget] = useState<Visita | null>(null)
  const [saving, setSaving] = useState(false)

  const { control, handleSubmit, reset, setValue } = useForm<VisitaFormInput>({
    resolver: zodResolver(visitaSchema),
    defaultValues: emptyValues,
  })

  const handleClose = () => {
    setOpen(false)
    setDialogTab(0)
    reset(emptyValues)
  }

  return (
    <Paper sx={{ p: 2 }}>
      <CrudSectionHeader
        title={ts('comercial.visitas.title')}
        actionLabel={ts('comercial.visitas.new')}
        onAction={() => {
          if (!canEdit) return
          setEditing(null)
          reset(emptyValues)
          setOpen(true)
        }}
      />

      {isLoading ? (
        <Typography color="text.secondary" sx={{ py: 2 }}>{ts('comercial.visitas.title')}...</Typography>
      ) : visitas.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 2 }}>{ts('common.emptyVisit')}</Typography>
      ) : (
        <List disablePadding>
          {visitas.map((item) => (
            <ListItem key={item.id} divider>
              <ListItemText
                primary={`${item.data} ${item.hora} — ${item.clienteNome}`}
                secondary={`${item.responsavel} · ${item.objetivo}`}
              />
              <ListItemSecondaryAction>
                <Tooltip title={ts('actions.edit')}>
                  <span>
                    <IconButton
                      size="small"
                      disabled={!canEdit}
                      onClick={() => {
                        setEditing(item)
                        reset({
                          data: item.data,
                          hora: item.hora,
                          clienteId: item.clienteId,
                          clienteNome: item.clienteNome,
                          responsavel: item.responsavel,
                          objetivo: item.objetivo,
                          resultado: item.resultado,
                          fotos: item.fotos,
                          videos: item.videos,
                          audios: item.audios,
                          gpsLat: item.gpsLat,
                          gpsLng: item.gpsLng,
                          observacoes: item.observacoes,
                        })
                        setOpen(true)
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title={ts('actions.delete')}>
                  <span>
                    <IconButton size="small" color="error" disabled={!canDelete} onClick={() => setRemoveTarget(item)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>{editing ? ts('comercial.visitas.edit') : ts('comercial.visitas.new')}</DialogTitle>
        <DialogContent>
          <Tabs value={dialogTab} onChange={(_, v) => setDialogTab(v)} sx={{ mb: 1 }}>
            <Tab label={ts('comercial.visitas.title')} />
            <Tab label={ts('attachments.tab')} disabled={!editing} />
          </Tabs>
          {dialogTab === 1 && editing ? (
            <ModuleAttachmentsTab
              entityId={editing.id}
              entityNome={editing.clienteNome}
              moduloContext="VISITAS"
            />
          ) : (
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Controller
                name="data"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    type="date"
                    label={ts('comercial.visitas.fields.data')}
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Controller
                name="hora"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    type="time"
                    label={ts('comercial.visitas.fields.hora')}
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Controller
                name="clienteId"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    select
                    label={ts('comercial.visitas.fields.cliente')}
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    onChange={(event) => {
                      field.onChange(event)
                      const selected = clientes.find((item) => item.id === event.target.value)
                      if (selected) {
                        setValue('clienteId', selected.id)
                        setValue('clienteNome', selected.nomeFantasia || selected.razaoSocial)
                      }
                    }}
                  >
                    {clientes.map((item) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.nomeFantasia || item.razaoSocial}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Controller
                name="clienteNome"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label={ts('comercial.visitas.fields.clienteNome')}
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            {[
              ['responsavel', ts('comercial.visitas.fields.responsavel')],
              ['objetivo', ts('comercial.visitas.fields.objetivo')],
              ['resultado', ts('comercial.visitas.fields.resultado')],
              ['gpsLat', ts('comercial.visitas.fields.gpsLat')],
              ['gpsLng', ts('comercial.visitas.fields.gpsLng')],
            ].map(([name, label]) => (
              <Grid size={{ xs: 12, md: 6 }} key={name}>
                <Controller
                  name={name as keyof VisitaFormInput}
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label={label}
                      fullWidth
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
            ))}

            <Grid size={{ xs: 12 }}>
              <Controller
                name="fotos"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    value={joinMedia(field.value)}
                    onChange={(event) => field.onChange(splitMedia(event.target.value))}
                    label={ts('comercial.visitas.fields.fotos')}
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="videos"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    value={joinMedia(field.value)}
                    onChange={(event) => field.onChange(splitMedia(event.target.value))}
                    label={ts('comercial.visitas.fields.videos')}
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="audios"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    value={joinMedia(field.value)}
                    onChange={(event) => field.onChange(splitMedia(event.target.value))}
                    label={ts('comercial.visitas.fields.audios')}
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="observacoes"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label={ts('comercial.visitas.fields.observacoes')}
                    fullWidth
                    multiline
                    minRows={3}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={saving}>{ts('actions.cancel')}</Button>
          {dialogTab === 0 && (
          <Button
            variant="contained"
            disabled={!canEdit || saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
            onClick={handleSubmit(async (payload) => {
              if (!canEdit) return
              setSaving(true)
              try {
                if (editing) {
                  await updateVisita.mutateAsync({ id: editing.id, payload })
                } else {
                  await createVisita.mutateAsync(payload)
                }
                handleClose()
              } finally {
                setSaving(false)
              }
            })}
          >
            {ts('actions.save')}
          </Button>
          )}
        </DialogActions>
      </Dialog>

      <ConfirmDeleteDialog
        open={Boolean(removeTarget)}
        title={ts('comercial.delete.visitaTitle')}
        description={ts('comercial.delete.visitaDescription', {
          cliente: removeTarget?.clienteNome || ts('comercial.clientes.title').toLowerCase(),
        })}
        loading={deleteVisita.isPending}
        onCancel={() => setRemoveTarget(null)}
        onConfirm={async () => {
          if (!canDelete) return
          if (!removeTarget) return
          await deleteVisita.mutateAsync(removeTarget.id)
          setRemoveTarget(null)
        }}
      />
    </Paper>
  )
}
