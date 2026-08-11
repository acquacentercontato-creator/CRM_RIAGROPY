/**
 * Dialog para criar/editar oportunidades de venda
 */

import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Slider,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { oportunidadeSchema, type OportunidadeFormInput } from '@/modules/comercial/validators/comercialValidators'
import type { Oportunidade } from '@/modules/comercial/types'
import { FUNIL_ETAPAS } from '@/modules/comercial/types'
import { useClientes } from '@/modules/comercial/hooks/useComercialData'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

interface OportunidadeFormDialogProps {
  open: boolean
  editing: Oportunidade | null
  loading: boolean
  onClose: () => void
  onSubmit: (payload: OportunidadeFormInput) => Promise<void>
}

const emptyValues: OportunidadeFormInput = {
  clienteId: '',
  clienteNome: '',
  nivel: 'MEDIA',
  etapaFunil: 'LEAD',
  valorEstimado: 0,
  probabilidade: 50,
  concorrente: '',
  dataFechamento: '',
  produto: '',
  tipoProduto: '',
  observacoes: '',
  responsavel: '',
}

export const OportunidadeFormDialog = ({
  open,
  editing,
  loading,
  onClose,
  onSubmit,
}: OportunidadeFormDialogProps) => {
  const ts = useTranslationService()
  const { data: clientes = [] } = useClientes()

  const { control, handleSubmit, reset, setValue } = useForm<OportunidadeFormInput>({
    resolver: zodResolver(oportunidadeSchema),
    defaultValues: editing
      ? {
          clienteId: editing.clienteId,
          clienteNome: editing.clienteNome,
          nivel: editing.nivel,
          etapaFunil: editing.etapaFunil ?? 'LEAD',
          valorEstimado: editing.valorEstimado ?? 0,
          probabilidade: editing.probabilidade ?? 50,
          concorrente: editing.concorrente ?? '',
          dataFechamento: editing.dataFechamento ?? '',
          produto: editing.produto ?? '',
          tipoProduto: editing.tipoProduto ?? '',
          observacoes: editing.observacoes ?? '',
          responsavel: editing.responsavel ?? '',
        }
      : emptyValues,
  })

  const handleClose = () => {
    reset(emptyValues)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {editing ? ts('crm.oportunidade.editar') : ts('crm.oportunidade.nova')}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12 }}>
            <Controller
              name="clienteId"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label={ts('crm.oportunidade.cliente')}
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                  onChange={(e) => {
                    field.onChange(e)
                    const cl = clientes.find((c) => c.id === e.target.value)
                    if (cl) setValue('clienteNome', cl.nomeFantasia || cl.razaoSocial)
                  }}
                >
                  {clientes.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.nomeFantasia || c.razaoSocial}</MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="etapaFunil"
              control={control}
              render={({ field }) => (
                <TextField {...field} select fullWidth label={ts('crm.oportunidade.etapa')}>
                  {FUNIL_ETAPAS.map((e) => (
                    <MenuItem key={e} value={e}>{ts(`crm.funil.${e}`)}</MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="nivel"
              control={control}
              render={({ field }) => (
                <TextField {...field} select fullWidth label={ts('crm.oportunidade.nivel')}>
                  <MenuItem value="ALTA">{ts('crm.nivel.ALTA')}</MenuItem>
                  <MenuItem value="MEDIA">{ts('crm.nivel.MEDIA')}</MenuItem>
                  <MenuItem value="BAIXA">{ts('crm.nivel.BAIXA')}</MenuItem>
                </TextField>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="valorEstimado"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="number"
                  label={ts('crm.oportunidade.valor')}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="probabilidade"
              control={control}
              render={({ field }) => (
                <Stack>
                  <Typography variant="caption" color="text.secondary">
                    {ts('crm.oportunidade.probabilidade')}: {field.value}%
                  </Typography>
                  <Slider
                    value={field.value}
                    onChange={(_, v) => field.onChange(v)}
                    min={0}
                    max={100}
                    step={5}
                    valueLabelDisplay="auto"
                    size="small"
                  />
                </Stack>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="produto"
              control={control}
              render={({ field }) => (
                <TextField {...field} fullWidth label={ts('crm.oportunidade.produto')} />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="concorrente"
              control={control}
              render={({ field }) => (
                <TextField {...field} fullWidth label={ts('crm.oportunidade.concorrente')} />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="responsavel"
              control={control}
              render={({ field }) => (
                <TextField {...field} fullWidth label={ts('crm.oportunidade.responsavel')} />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="dataFechamento"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="date"
                  label={ts('crm.oportunidade.dataFechamento')}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="observacoes"
              control={control}
              render={({ field }) => (
                <TextField {...field} fullWidth multiline rows={2} label={ts('crm.oportunidade.observacoes')} />
              )}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{ts('actions.cancel')}</Button>
        <Button
          variant="contained"
          disabled={loading}
          onClick={handleSubmit(async (data) => {
            await onSubmit(data)
            handleClose()
          })}
        >
          {ts('actions.save')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
