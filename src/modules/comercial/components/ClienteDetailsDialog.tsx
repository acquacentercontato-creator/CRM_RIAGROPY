import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import type { Cliente } from '@/modules/comercial/types'
import { ModuleAttachmentsTab } from '@/shared/attachments'
import { FollowUpPanel } from './FollowUpPanel'
import { useFollowUps, useFollowUpMutations } from '@/modules/comercial/hooks/useComercialData'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

type ClienteDetailsDialogProps = {
  open: boolean
  onClose: () => void
  cliente: Cliente | null
}

const TAB_DOCUMENTOS = 6
const TAB_FOLLOWUP = 8

const TEMP_COLORS: Record<string, 'default' | 'primary' | 'warning' | 'error'> = {
  FRIO: 'default', MORNO: 'primary', QUENTE: 'warning', URGENTE: 'error',
}

const STATUS_COLOR: Record<string, 'success' | 'warning' | 'default'> = {
  ATIVO: 'success', PROSPECT: 'warning', INATIVO: 'default',
}

const tabs = [
  'comercial.details.tabs.dadosGerais',
  'comercial.details.tabs.contatos',
  'comercial.details.tabs.visitas',
  'comercial.details.tabs.levantamentos',
  'comercial.details.tabs.projetos',
  'comercial.details.tabs.obras',
  'comercial.details.tabs.documentos',
  'comercial.details.tabs.historico',
  'crm.followup.title',
]

export const ClienteDetailsDialog = ({ open, onClose, cliente }: ClienteDetailsDialogProps) => {
  const [tab, setTab] = useState(0)
  const ts = useTranslationService()
  const { data: allFollowUps = [] } = useFollowUps()
  const { createFollowUp, updateFollowUp, deleteFollowUp } = useFollowUpMutations()

  // Filter follow-ups client-side since the hook returns all records
  const followUps = allFollowUps.filter((f) => f.clienteId === cliente?.id)

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="h6" component="span">
            {cliente?.nomeFantasia || cliente?.razaoSocial || '—'}
          </Typography>
          {cliente?.status && (
            <Chip
              label={ts(`comercial.status.${cliente.status}`)}
              color={STATUS_COLOR[cliente.status] ?? 'default'}
              size="small"
            />
          )}
          {cliente?.classificacao && (
            <Chip label={ts(`crm.cliente.classificacoes.${cliente.classificacao}`)} size="small" color="primary" variant="outlined" />
          )}
          {cliente?.temperatura && (
            <Chip
              label={ts(`crm.cliente.temperaturas.${cliente.temperatura}`)}
              size="small"
              color={TEMP_COLORS[cliente.temperatura] ?? 'default'}
              variant="outlined"
            />
          )}
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2 }}>
          {tabs.map((item) => (
            <Tab key={item} label={ts(item)} />
          ))}
        </Tabs>

        {tab === 0 && cliente && (
          <Grid container spacing={1.5}>
            {[
              [ts('common.code'), cliente.codigoInterno],
              [ts('comercial.clientes.razaoSocial'), cliente.razaoSocial],
              [ts('comercial.clientes.nomeFantasia'), cliente.nomeFantasia],
              [ts('comercial.clientes.rucCnpj'), cliente.rucCnpj],
              [ts('comercial.fields.contatoPrincipal'), cliente.contatoPrincipal],
              [ts('comercial.fields.telefone'), cliente.telefone],
              [ts('comercial.fields.whatsapp'), cliente.whatsapp],
              [ts('comercial.fields.email'), cliente.email],
              [ts('comercial.fields.cidade'), `${cliente.cidade} — ${cliente.departamento} — ${cliente.pais}`],
              [ts('comercial.clientes.responsavel'), cliente.responsavelComercial],
            ].map(([label, value]) => (
              <Grid key={label} size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">{label}</Typography>
                <Typography variant="body2">{value || '—'}</Typography>
                <Divider sx={{ mt: 0.5 }} />
              </Grid>
            ))}
            {cliente.classificacao && (
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="text.secondary">{ts('crm.cliente.classificacao')}</Typography>
                <Typography variant="body2">{ts(`crm.cliente.classificacoes.${cliente.classificacao}`)}</Typography>
              </Grid>
            )}
            {cliente.origem && (
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="text.secondary">{ts('crm.cliente.origem')}</Typography>
                <Typography variant="body2">{ts(`crm.cliente.origens.${cliente.origem}`)}</Typography>
              </Grid>
            )}
            {cliente.temperatura && (
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="text.secondary">{ts('crm.cliente.temperatura')}</Typography>
                <Typography variant="body2">{ts(`crm.cliente.temperaturas.${cliente.temperatura}`)}</Typography>
              </Grid>
            )}
            {cliente.observacoes && (
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" color="text.secondary">{ts('comercial.fields.observacoes')}</Typography>
                <Typography variant="body2">{cliente.observacoes}</Typography>
              </Grid>
            )}
          </Grid>
        )}

        {tab === TAB_DOCUMENTOS && cliente && (
          <ModuleAttachmentsTab
            entityId={cliente.id}
            entityNome={cliente.nomeFantasia || cliente.razaoSocial}
            moduloContext="CLIENTES"
          />
        )}

        {tab === TAB_FOLLOWUP && cliente && (
          <FollowUpPanel
            clienteId={cliente.id}
            clienteNome={cliente.nomeFantasia || cliente.razaoSocial}
            followUps={followUps}
            onCriar={async (payload) => { await createFollowUp.mutateAsync(payload) }}
            onAtualizar={async (id, payload) => { await updateFollowUp.mutateAsync({ id, payload }) }}
            onDeletar={async (id) => { await deleteFollowUp.mutateAsync(id) }}
          />
        )}

        {tab !== 0 && tab !== TAB_DOCUMENTOS && tab !== TAB_FOLLOWUP && (
          <Typography color="text.secondary" sx={{ py: 2 }}>
            {ts('comercial.details.pending')}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{ts('actions.close')}</Button>
      </DialogActions>
    </Dialog>
  )
}

type ClienteDetailsDialogProps = {
  open: boolean
  onClose: () => void
  cliente: Cliente | null
}

const TAB_DOCUMENTOS = 6
const TAB_FOLLOWUP = 8

const TEMP_COLORS: Record<string, 'default' | 'primary' | 'warning' | 'error'> = {
  FRIO: 'default', MORNO: 'primary', QUENTE: 'warning', URGENTE: 'error',
}

const tabs = [
  'comercial.details.tabs.dadosGerais',
  'comercial.details.tabs.contatos',
  'comercial.details.tabs.visitas',
  'comercial.details.tabs.levantamentos',
  'comercial.details.tabs.projetos',
  'comercial.details.tabs.obras',
  'comercial.details.tabs.documentos',
  'comercial.details.tabs.historico',
  'crm.followup.title',
]

export const ClienteDetailsDialog = ({ open, onClose, cliente }: ClienteDetailsDialogProps) => {
  const [tab, setTab] = useState(0)
  const ts = useTranslationService()
  const { data: followUps = [] } = useFollowUps()
  const { createFollowUp, updateFollowUp, deleteFollowUp } = useFollowUpMutations()

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <span>{cliente?.nomeFantasia || cliente?.razaoSocial || ts('comercial.agenda.fields.cliente')}</span>
          {cliente?.classificacao && (
            <Chip label={ts(`crm.cliente.classificacoes.${cliente.classificacao}`)} size="small" color="primary" />
          )}
          {cliente?.temperatura && (
            <Chip
              label={ts(`crm.cliente.temperaturas.${cliente.temperatura}`)}
              size="small"
              color={TEMP_COLORS[cliente.temperatura] ?? 'default'}
            />
          )}
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable">
          {tabs.map((item) => (
            <Tab key={item} label={ts(item)} />
          ))}
        </Tabs>

        <Box sx={{ pt: 2 }}>
          {tab === 0 && (
            <Box sx={{ display: 'grid', gap: 1 }}>
              <Typography variant="body2">{ts('common.code')}: {cliente?.codigoInterno}</Typography>
              <Typography variant="body2">{ts('comercial.clientes.razaoSocial')}: {cliente?.razaoSocial}</Typography>
              <Typography variant="body2">{ts('comercial.clientes.nomeFantasia')}: {cliente?.nomeFantasia}</Typography>
              <Typography variant="body2">{ts('comercial.clientes.rucCnpj')}: {cliente?.rucCnpj}</Typography>
              <Typography variant="body2">{ts('common.status')}: {cliente?.status}</Typography>
              <Typography variant="body2">{ts('comercial.clientes.responsavel')}: {cliente?.responsavelComercial}</Typography>
              {cliente?.classificacao && (
                <Typography variant="body2">{ts('crm.cliente.classificacao')}: {ts(`crm.cliente.classificacoes.${cliente.classificacao}`)}</Typography>
              )}
              {cliente?.origem && (
                <Typography variant="body2">{ts('crm.cliente.origem')}: {ts(`crm.cliente.origens.${cliente.origem}`)}</Typography>
              )}
              {cliente?.temperatura && (
                <Typography variant="body2">{ts('crm.cliente.temperatura')}: {ts(`crm.cliente.temperaturas.${cliente.temperatura}`)}</Typography>
              )}
            </Box>
          )}

          {tab === TAB_DOCUMENTOS && cliente && (
            <ModuleAttachmentsTab
              entityId={cliente.id}
              entityNome={cliente.nomeFantasia || cliente.razaoSocial}
              moduloContext="CLIENTES"
            />
          )}

          {tab === TAB_FOLLOWUP && cliente && (
            <FollowUpPanel
              clienteId={cliente.id}
              clienteNome={cliente.nomeFantasia || cliente.razaoSocial}
              followUps={followUps}
              onCriar={async (payload) => { await createFollowUp.mutateAsync(payload) }}
              onAtualizar={async (id, payload) => { await updateFollowUp.mutateAsync({ id, payload }) }}
              onDeletar={(id) => deleteFollowUp.mutateAsync(id)}
            />
          )}

          {tab !== 0 && tab !== TAB_DOCUMENTOS && tab !== TAB_FOLLOWUP && (
            <Typography color="text.secondary">
              {ts('comercial.details.pending')}
            </Typography>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  )
}
