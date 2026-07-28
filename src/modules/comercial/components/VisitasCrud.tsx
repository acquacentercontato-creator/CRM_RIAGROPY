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
  TextField,
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
  const { data: visitas = [] } = useVisitas()
  const { data: clientes = [] } = useClientes()
  const { createVisita, updateVisita, deleteVisita } = useVisitaMutations()

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Visita | null>(null)
  const [removeTarget, setRemoveTarget] = useState<Visita | null>(null)

  const { control, handleSubmit, reset, setValue } = useForm<VisitaFormInput>({
    resolver: zodResolver(visitaSchema),
    defaultValues: emptyValues,
  })

  return (
    <Paper sx={{ p: 2 }}>
      <CrudSectionHeader
        title="Visitas Comerciais"
        actionLabel="Nova visita"
        onAction={() => {
          setEditing(null)
          reset(emptyValues)
          setOpen(true)
        }}
      />

      <List>
        {visitas.map((item) => (
          <ListItem key={item.id} divider>
            <ListItemText
              primary={`${item.data} ${item.hora} | ${item.clienteNome}`}
              secondary={`${item.responsavel} | ${item.objetivo}`}
            />
            <ListItemSecondaryAction>
              <IconButton
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
              <IconButton color="error" onClick={() => setRemoveTarget(item)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{editing ? 'Editar visita' : 'Nova visita'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, md: 3 }}>
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
            <Grid size={{ xs: 12, md: 3 }}>
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
            <Grid size={{ xs: 12, md: 3 }}>
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
            <Grid size={{ xs: 12, md: 3 }}>
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
            {[
              ['responsavel', 'Responsavel'],
              ['objetivo', 'Objetivo'],
              ['resultado', 'Resultado'],
              ['gpsLat', 'GPS Latitude'],
              ['gpsLng', 'GPS Longitude'],
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
                    label="Fotos (URLs separadas por virgula)"
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
                    label="Videos (URLs separadas por virgula)"
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
                    label="Audios (URLs separadas por virgula)"
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
                    label="Observacoes"
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
                await updateVisita.mutateAsync({ id: editing.id, payload })
              } else {
                await createVisita.mutateAsync(payload)
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
        title="Excluir visita"
        description={`Confirma exclusao da visita de ${removeTarget?.clienteNome || 'cliente'}?`}
        loading={deleteVisita.isPending}
        onCancel={() => setRemoveTarget(null)}
        onConfirm={async () => {
          if (!removeTarget) return
          await deleteVisita.mutateAsync(removeTarget.id)
          setRemoveTarget(null)
        }}
      />
    </Paper>
  )
}
