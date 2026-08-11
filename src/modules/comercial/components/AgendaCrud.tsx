import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
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
  Typography,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { agendaSchema, type AgendaFormInput } from '@/modules/comercial/validators/comercialValidators'
import { useAgenda, useAgendaMutations, useClientes } from '@/modules/comercial/hooks/useComercialData'
import type { AgendaCompromisso } from '@/modules/comercial/types'
import { ModuleAttachmentsTab } from '@/shared/attachments'
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog'
import { CrudSectionHeader } from './CrudSectionHeader'
import { useAuth } from '@/auth/AuthContext'
import { PermissionService } from '@/shared/auth/PermissionService'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

const emptyValues: AgendaFormInput = {
  titulo: '',
  clienteId: '',
  clienteNome: '',
  data: '',
  hora: '',
  tipo: 'REUNIAO',
  status: 'PENDENTE',
  descricao: '',
}

export const AgendaCrud = () => {
  const { data: agenda = [] } = useAgenda()
  const { data: clientes = [] } = useClientes()
  const { createAgenda, updateAgenda, deleteAgenda } = useAgendaMutations()
  const { user } = useAuth()
  const ts = useTranslationService()

  const canEdit = PermissionService.canEdit(user?.role)
  const canDelete = PermissionService.canDelete(user?.role)

  const [tab, setTab] = useState(0)
  const [open, setOpen] = useState(false)
  const [dialogTab, setDialogTab] = useState(0)
  const [editing, setEditing] = useState<AgendaCompromisso | null>(null)
  const [removeTarget, setRemoveTarget] = useState<AgendaCompromisso | null>(null)

  const proximos = useMemo(
    () =>
      [...agenda]
        .sort((a, b) => `${a.data} ${a.hora}`.localeCompare(`${b.data} ${b.hora}`))
        .slice(0, 8),
    [agenda]
  )

  const { control, handleSubmit, reset, setValue } = useForm<AgendaFormInput>({
    resolver: zodResolver(agendaSchema),
    defaultValues: emptyValues,
  })

  return (
    <Paper sx={{ p: 2 }}>
      <CrudSectionHeader
        title={ts('comercial.agenda.title')}
        actionLabel={ts('comercial.agenda.new')}
        onAction={() => {
          if (!canEdit) return
          reset(emptyValues)
          setEditing(null)
          setOpen(true)
        }}
      />

      <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 2 }}>
        <Tab label={ts('comercial.agenda.tabs.calendario')} />
        <Tab label={ts('comercial.agenda.tabs.lista')} />
        <Tab label={ts('comercial.agenda.tabs.proximos')} />
      </Tabs>

      {tab === 0 && (
        <Typography color="text.secondary">{ts('comercial.agenda.calendarReady')}</Typography>
      )}

      {tab === 1 && (
        <List>
          {agenda.map((item) => (
            <ListItem key={item.id} divider>
              <ListItemText
                primary={`${item.data} ${item.hora} | ${item.titulo}`}
                secondary={`${item.clienteNome} | ${item.tipo} | ${item.status}`}
              />
              <ListItemSecondaryAction>
                <IconButton
                  disabled={!canEdit}
                  onClick={() => {
                    setEditing(item)
                    reset({
                      titulo: item.titulo,
                      clienteId: item.clienteId,
                      clienteNome: item.clienteNome,
                      data: item.data,
                      hora: item.hora,
                      tipo: item.tipo,
                      status: item.status,
                      descricao: item.descricao,
                    })
                    setOpen(true)
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton color="error" disabled={!canDelete} onClick={() => setRemoveTarget(item)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      {tab === 2 && (
        <List>
          {proximos.map((item) => (
            <ListItem key={item.id} divider>
              <ListItemText
                primary={`${item.data} ${item.hora} | ${item.titulo}`}
                secondary={`${item.clienteNome} | ${item.status}`}
              />
            </ListItem>
          ))}
        </List>
      )}

      <Dialog open={open} onClose={() => { setOpen(false); setDialogTab(0) }} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? ts('comercial.agenda.edit') : ts('comercial.agenda.new')}</DialogTitle>
        <DialogContent>
          <Tabs value={dialogTab} onChange={(_, v) => setDialogTab(v)} sx={{ mb: 1 }}>
            <Tab label={ts('comercial.agenda.tabs.lista')} />
            <Tab label={ts('attachments.tab')} disabled={!editing} />
          </Tabs>

          {dialogTab === 1 && editing ? (
            <ModuleAttachmentsTab
              entityId={editing.id}
              entityNome={editing.clienteNome}
              moduloContext="COMERCIAL"
            />
          ) : (
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="titulo"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label={ts('comercial.agenda.fields.titulo')}
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="clienteId"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    select
                    label={ts('comercial.agenda.fields.cliente')}
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
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="clienteNome"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label={ts('comercial.agenda.fields.clienteNome')}
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="data"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    type="date"
                    label={ts('comercial.agenda.fields.data')}
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="hora"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    type="time"
                    label={ts('comercial.agenda.fields.hora')}
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="tipo"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    select
                    label={ts('comercial.agenda.fields.tipo')}
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  >
                    <MenuItem value="LIGACAO">{ts('comercial.agenda.tipos.LIGACAO')}</MenuItem>
                    <MenuItem value="REUNIAO">{ts('comercial.agenda.tipos.REUNIAO')}</MenuItem>
                    <MenuItem value="VISITA">{ts('comercial.agenda.tipos.VISITA')}</MenuItem>
                    <MenuItem value="FOLLOW_UP">{ts('comercial.agenda.tipos.FOLLOW_UP')}</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="status"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    select
                    label={ts('common.status')}
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  >
                    <MenuItem value="PENDENTE">{ts('comercial.agenda.status.PENDENTE')}</MenuItem>
                    <MenuItem value="CONCLUIDO">{ts('comercial.agenda.status.CONCLUIDO')}</MenuItem>
                    <MenuItem value="CANCELADO">{ts('comercial.agenda.status.CANCELADO')}</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="descricao"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label={ts('comercial.agenda.fields.descricao')}
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
          <Button onClick={() => { setOpen(false); setDialogTab(0) }}>{ts('actions.cancel')}</Button>
          {dialogTab === 0 && (
          <Button
            variant="contained"
            disabled={!canEdit}
            onClick={handleSubmit(async (payload) => {
              if (!canEdit) return
              if (editing) {
                await updateAgenda.mutateAsync({ id: editing.id, payload })
              } else {
                await createAgenda.mutateAsync(payload)
              }
              setOpen(false)
              setDialogTab(0)
            })}
          >
            {ts('actions.save')}
          </Button>
          )}
        </DialogActions>
      </Dialog>

      <ConfirmDeleteDialog
        open={Boolean(removeTarget)}
        title={ts('comercial.delete.compromissoTitle')}
        description={ts('comercial.delete.compromissoDescription', { titulo: removeTarget?.titulo || '' })}
        loading={deleteAgenda.isPending}
        onCancel={() => setRemoveTarget(null)}
        onConfirm={async () => {
          if (!canDelete) return
          if (!removeTarget) return
          await deleteAgenda.mutateAsync(removeTarget.id)
          setRemoveTarget(null)
        }}
      />
    </Paper>
  )
}
