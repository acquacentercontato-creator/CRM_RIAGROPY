import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
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
              <Typography variant="body2">
                {ts('common.status')}: {cliente?.status ? ts(`comercial.status.${cliente.status}`) : ''}
              </Typography>
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
