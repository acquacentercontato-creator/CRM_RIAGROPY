import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  TextField,
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { clienteSchema, type ClienteFormInput } from '@/modules/comercial/validators/comercialValidators'
import type { Cliente } from '@/modules/comercial/types'

type ClienteFormDialogProps = {
  open: boolean
  onClose: () => void
  onSubmit: (payload: ClienteFormInput) => Promise<void>
  loading: boolean
  initialData?: Cliente
}

const emptyValues: ClienteFormInput = {
  razaoSocial: '',
  nomeFantasia: '',
  rucCnpj: '',
  contatoPrincipal: '',
  telefone: '',
  whatsapp: '',
  email: '',
  pais: '',
  departamento: '',
  cidade: '',
  endereco: '',
  latitude: '',
  longitude: '',
  observacoes: '',
  status: 'PROSPECT',
  responsavelComercial: '',
}

export const ClienteFormDialog = ({
  open,
  onClose,
  onSubmit,
  loading,
  initialData,
}: ClienteFormDialogProps) => {
  const { control, handleSubmit, reset } = useForm<ClienteFormInput>({
    resolver: zodResolver(clienteSchema),
    defaultValues: initialData
      ? {
          razaoSocial: initialData.razaoSocial,
          nomeFantasia: initialData.nomeFantasia,
          rucCnpj: initialData.rucCnpj,
          contatoPrincipal: initialData.contatoPrincipal,
          telefone: initialData.telefone,
          whatsapp: initialData.whatsapp,
          email: initialData.email,
          pais: initialData.pais,
          departamento: initialData.departamento,
          cidade: initialData.cidade,
          endereco: initialData.endereco,
          latitude: initialData.latitude,
          longitude: initialData.longitude,
          observacoes: initialData.observacoes,
          status: initialData.status,
          responsavelComercial: initialData.responsavelComercial,
        }
      : emptyValues,
  })

  return (
    <Dialog
      open={open}
      onClose={() => {
        reset(initialData ? undefined : emptyValues)
        onClose()
      }}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>{initialData ? 'Editar cliente' : 'Novo cliente'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {[
            ['razaoSocial', 'Razao Social'],
            ['nomeFantasia', 'Nome Fantasia'],
            ['rucCnpj', 'RUC/CNPJ'],
            ['contatoPrincipal', 'Contato Principal'],
            ['telefone', 'Telefone'],
            ['whatsapp', 'WhatsApp'],
            ['email', 'Email'],
            ['pais', 'Pais'],
            ['departamento', 'Departamento'],
            ['cidade', 'Cidade'],
            ['endereco', 'Endereco'],
            ['latitude', 'Latitude'],
            ['longitude', 'Longitude'],
            ['responsavelComercial', 'Responsavel Comercial'],
          ].map(([name, label]) => (
            <Grid key={name} size={{ xs: 12, md: 6 }}>
              <Controller
                name={name as keyof ClienteFormInput}
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label={label}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    fullWidth
                  />
                )}
              />
            </Grid>
          ))}

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="status"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  label="Status"
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                  fullWidth
                >
                  <MenuItem value="PROSPECT">Prospect</MenuItem>
                  <MenuItem value="ATIVO">Ativo</MenuItem>
                  <MenuItem value="INATIVO">Inativo</MenuItem>
                </TextField>
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
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                  fullWidth
                  multiline
                  minRows={3}
                />
              )}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={handleSubmit(async (payload) => {
            await onSubmit(payload)
            onClose()
          })}
          disabled={loading}
          variant="contained"
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
