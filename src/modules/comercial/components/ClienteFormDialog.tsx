import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  CircularProgress,
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
import { useTranslationService } from '@/shared/hooks/useTranslationService'

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
  classificacao: undefined,
  origem: undefined,
  temperatura: undefined,
}

export const ClienteFormDialog = ({
  open,
  onClose,
  onSubmit,
  loading,
  initialData,
}: ClienteFormDialogProps) => {
  const ts = useTranslationService()

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
          classificacao: initialData.classificacao,
          origem: initialData.origem,
          temperatura: initialData.temperatura,
        }
      : emptyValues,
  })

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!loading) {
          reset(emptyValues)
          onClose()
        }
      }}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>{initialData ? ts('comercial.clientes.edit') : ts('comercial.clientes.newLower')}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {[
            ['razaoSocial', ts('comercial.clientes.razaoSocial')],
            ['nomeFantasia', ts('comercial.clientes.nomeFantasia')],
            ['rucCnpj', ts('comercial.clientes.rucCnpj')],
            ['contatoPrincipal', ts('comercial.fields.contatoPrincipal')],
            ['telefone', ts('comercial.fields.telefone')],
            ['whatsapp', ts('comercial.fields.whatsapp')],
            ['email', ts('comercial.fields.email')],
            ['pais', ts('comercial.fields.pais')],
            ['departamento', ts('comercial.fields.departamento')],
            ['cidade', ts('comercial.fields.cidade')],
            ['endereco', ts('comercial.fields.endereco')],
            ['latitude', ts('comercial.fields.latitude')],
            ['longitude', ts('comercial.fields.longitude')],
            ['responsavelComercial', ts('comercial.fields.responsavelComercial')],
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
                  label={ts('common.status')}
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                  fullWidth
                >
                  <MenuItem value="PROSPECT">{ts('comercial.status.PROSPECT')}</MenuItem>
                  <MenuItem value="ATIVO">{ts('comercial.status.ATIVO')}</MenuItem>
                  <MenuItem value="INATIVO">{ts('comercial.status.INATIVO')}</MenuItem>
                </TextField>
              )}
            />
          </Grid>

          {/* CRM fields */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name="classificacao"
              control={control}
              render={({ field }) => (
                <TextField {...field} select fullWidth label={ts('crm.cliente.classificacao')} value={field.value ?? ''}>
                  <MenuItem value="">{ts('common.noSelection')}</MenuItem>
                  {(['LEAD', 'PROSPECT', 'CLIENTE', 'VIP'] as const).map((v) => (
                    <MenuItem key={v} value={v}>{ts(`crm.cliente.classificacoes.${v}`)}</MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name="origem"
              control={control}
              render={({ field }) => (
                <TextField {...field} select fullWidth label={ts('crm.cliente.origem')} value={field.value ?? ''}>
                  <MenuItem value="">{ts('common.noSelection')}</MenuItem>
                  {(['INSTAGRAM', 'FACEBOOK', 'YOUTUBE', 'INDICACAO', 'SITE', 'FEIRA', 'WHATSAPP', 'LIGACAO', 'OUTRO'] as const).map((v) => (
                    <MenuItem key={v} value={v}>{ts(`crm.cliente.origens.${v}`)}</MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name="temperatura"
              control={control}
              render={({ field }) => (
                <TextField {...field} select fullWidth label={ts('crm.cliente.temperatura')} value={field.value ?? ''}>
                  <MenuItem value="">{ts('common.noSelection')}</MenuItem>
                  {(['FRIO', 'MORNO', 'QUENTE', 'URGENTE'] as const).map((v) => (
                    <MenuItem key={v} value={v}>{ts(`crm.cliente.temperaturas.${v}`)}</MenuItem>
                  ))}
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
                  label={ts('comercial.fields.observacoes')}
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
        <Button onClick={onClose} disabled={loading}>{ts('actions.cancel')}</Button>
        <Button
          onClick={handleSubmit(async (payload) => {
            await onSubmit(payload)
            reset(emptyValues)
            onClose()
          })}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
          variant="contained"
        >
          {ts('actions.save')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
