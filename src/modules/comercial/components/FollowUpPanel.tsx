/**
 * Painel de Follow-up comercial com notificações automáticas
 */

import { useState } from 'react'
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import CheckIcon from '@mui/icons-material/Check'
import DeleteIcon from '@mui/icons-material/Delete'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import VideocamIcon from '@mui/icons-material/Videocam'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { followUpSchema, type FollowUpFormInput } from '@/modules/comercial/validators/comercialValidators'
import type { FollowUp } from '@/modules/comercial/types'
import { NotificationService } from '@/shared/services/NotificationService'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

const TYPE_ICON: Record<string, React.ReactNode> = {
  LIGACAO: <PhoneIcon fontSize="small" />,
  VISITA: <VideocamIcon fontSize="small" />,
  WHATSAPP: <WhatsAppIcon fontSize="small" />,
  EMAIL: <EmailIcon fontSize="small" />,
}

const STATUS_COLOR = {
  PENDENTE: 'warning',
  REALIZADO: 'success',
  CANCELADO: 'error',
} as const

interface FollowUpPanelProps {
  clienteId: string
  clienteNome: string
  followUps: FollowUp[]
  onCriar: (payload: FollowUpFormInput) => Promise<void>
  onAtualizar: (id: string, payload: Partial<FollowUpFormInput>) => Promise<void>
  onDeletar: (id: string) => Promise<void>
}

const emptyValues: FollowUpFormInput = {
  clienteId: '',
  clienteNome: '',
  tipo: 'LIGACAO',
  dataHora: new Date().toISOString().slice(0, 16),
  descricao: '',
  status: 'PENDENTE',
}

export const FollowUpPanel = ({
  clienteId,
  clienteNome,
  followUps,
  onCriar,
  onAtualizar,
  onDeletar,
}: FollowUpPanelProps) => {
  const ts = useTranslationService()
  const [open, setOpen] = useState(false)

  const { control, handleSubmit, reset } = useForm<FollowUpFormInput>({
    resolver: zodResolver(followUpSchema),
    defaultValues: { ...emptyValues, clienteId, clienteNome },
  })

  const clienteFollowUps = followUps.filter((f) => f.clienteId === clienteId)
  const pendentes = clienteFollowUps.filter((f) => f.status === 'PENDENTE')

  const handleRealizar = async (followUp: FollowUp) => {
    await onAtualizar(followUp.id, { status: 'REALIZADO' })
  }

  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2">
          {ts('crm.followup.title')}
          {pendentes.length > 0 && (
            <Chip label={pendentes.length} size="small" color="warning" sx={{ ml: 1 }} />
          )}
        </Typography>
        <Button size="small" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          {ts('crm.followup.novo')}
        </Button>
      </Stack>

      <List disablePadding dense>
        {clienteFollowUps.slice(0, 8).map((item) => (
          <ListItem
            key={item.id}
            disablePadding
            divider
            secondaryAction={
              <Stack direction="row">
                {item.status === 'PENDENTE' && (
                  <IconButton size="small" onClick={() => handleRealizar(item)} color="success">
                    <CheckIcon fontSize="small" />
                  </IconButton>
                )}
                <IconButton size="small" onClick={() => onDeletar(item.id)} color="error">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            }
          >
            <ListItemText
              primary={
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  {TYPE_ICON[item.tipo]}
                  <Typography variant="caption">{item.descricao}</Typography>
                  <Chip
                    label={ts(`crm.followup.status.${item.status}`)}
                    size="small"
                    color={STATUS_COLOR[item.status]}
                    sx={{ fontSize: 9, height: 16 }}
                  />
                </Stack>
              }
              secondary={
                <Typography variant="caption" color="text.secondary">
                  {new Date(item.dataHora).toLocaleString()}
                </Typography>
              }
            />
          </ListItem>
        ))}
        {clienteFollowUps.length === 0 && (
          <Typography variant="caption" color="text.disabled">
            {ts('crm.followup.vazio')}
          </Typography>
        )}
      </List>

      {/* Create dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{ts('crm.followup.novo')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="tipo"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select fullWidth label={ts('crm.followup.tipo')}>
                    <MenuItem value="LIGACAO">{ts('crm.followup.tipos.LIGACAO')}</MenuItem>
                    <MenuItem value="VISITA">{ts('crm.followup.tipos.VISITA')}</MenuItem>
                    <MenuItem value="WHATSAPP">{ts('crm.followup.tipos.WHATSAPP')}</MenuItem>
                    <MenuItem value="EMAIL">{ts('crm.followup.tipos.EMAIL')}</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="dataHora"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="datetime-local"
                    label={ts('crm.followup.dataHora')}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
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
                    fullWidth
                    multiline
                    rows={2}
                    label={ts('crm.followup.descricao')}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>{ts('actions.cancel')}</Button>
          <Button
            variant="contained"
            onClick={handleSubmit(async (data) => {
              await onCriar({ ...data, clienteId, clienteNome })
              NotificationService.create(
                'info',
                ts('crm.followup.notif.titulo'),
                ts('crm.followup.notif.msg') + ` ${clienteNome} — ${new Date(data.dataHora).toLocaleString()}`,
                { tipo: data.tipo, clienteId }
              )
              reset({ ...emptyValues, clienteId, clienteNome })
              setOpen(false)
            })}
          >
            {ts('actions.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}
