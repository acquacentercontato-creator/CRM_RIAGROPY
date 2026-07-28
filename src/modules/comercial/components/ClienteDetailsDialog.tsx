import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import type { Cliente } from '@/modules/comercial/types'

type ClienteDetailsDialogProps = {
  open: boolean
  onClose: () => void
  cliente: Cliente | null
}

const tabs = [
  'Dados Gerais',
  'Contatos',
  'Visitas',
  'Levantamentos',
  'Projetos',
  'Obras',
  'Documentos',
  'Historico',
]

export const ClienteDetailsDialog = ({ open, onClose, cliente }: ClienteDetailsDialogProps) => {
  const [tab, setTab] = useState(0)

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{cliente?.nomeFantasia || cliente?.razaoSocial || 'Cliente'}</DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable">
          {tabs.map((item) => (
            <Tab key={item} label={item} />
          ))}
        </Tabs>

        <Box sx={{ pt: 2 }}>
          {tab === 0 && (
            <Box sx={{ display: 'grid', gap: 1 }}>
              <Typography variant="body2">Codigo: {cliente?.codigoInterno}</Typography>
              <Typography variant="body2">Razao Social: {cliente?.razaoSocial}</Typography>
              <Typography variant="body2">Nome Fantasia: {cliente?.nomeFantasia}</Typography>
              <Typography variant="body2">RUC/CNPJ: {cliente?.rucCnpj}</Typography>
              <Typography variant="body2">Status: {cliente?.status}</Typography>
              <Typography variant="body2">Responsavel: {cliente?.responsavelComercial}</Typography>
            </Box>
          )}

          {tab !== 0 && (
            <Typography color="text.secondary">
              Estrutura da aba pronta para integracao de dados deste cliente.
            </Typography>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  )
}
