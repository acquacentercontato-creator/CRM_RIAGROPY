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
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog'
import { CrudSectionHeader } from './CrudSectionHeader'

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

  const [tab, setTab] = useState(0)
  const [open, setOpen] = useState(false)
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
        title="Agenda Comercial"
        actionLabel="Novo compromisso"
        onAction={() => {
          reset(emptyValues)
          setEditing(null)
          setOpen(true)
        }}
      />

      <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 2 }}>
        <Tab label="Calendario" />
        <Tab label="Lista" />
        <Tab label="Proximos" />
      </Tabs>

      {tab === 0 && (
        <Typography color="text.secondary">Calendario operacional pronto para integracao futura.</Typography>
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
                <IconButton color="error" onClick={() => setRemoveTarget(item)}>
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

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Editar compromisso' : 'Novo compromisso'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="titulo"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Titulo"
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
                    label="Cliente"
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
                    label="Cliente (nome)"
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
                    label="Data"
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
                    label="Hora"
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
                    label="Tipo"
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  >
                    <MenuItem value="LIGACAO">Ligacao</MenuItem>
                    <MenuItem value="REUNIAO">Reuniao</MenuItem>
                    <MenuItem value="VISITA">Visita</MenuItem>
                    <MenuItem value="FOLLOW_UP">Follow-up</MenuItem>
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
                    label="Status"
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  >
                    <MenuItem value="PENDENTE">Pendente</MenuItem>
                    <MenuItem value="CONCLUIDO">Concluido</MenuItem>
                    <MenuItem value="CANCELADO">Cancelado</MenuItem>
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
                    label="Descricao"
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSubmit(async (payload) => {
              if (editing) {
                await updateAgenda.mutateAsync({ id: editing.id, payload })
              } else {
                await createAgenda.mutateAsync(payload)
              }
              setOpen(false)
            })}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDeleteDialog
        open={Boolean(removeTarget)}
        title="Excluir compromisso"
        description={`Confirma exclusao do compromisso ${removeTarget?.titulo || ''}?`}
        loading={deleteAgenda.isPending}
        onCancel={() => setRemoveTarget(null)}
        onConfirm={async () => {
          if (!removeTarget) return
          await deleteAgenda.mutateAsync(removeTarget.id)
          setRemoveTarget(null)
        }}
      />
    </Paper>
  )
}
