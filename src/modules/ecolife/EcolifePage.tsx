import { Agriculture, Egg, Spa } from '@mui/icons-material'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { EcolifeDashboard } from '@/modules/ecolife/components/EcolifeDashboard'
import { EcolifeDiagnosticDialog } from '@/modules/ecolife/components/EcolifeDiagnosticDialog'
import { EcolifeDiagnosticsTable } from '@/modules/ecolife/components/EcolifeDiagnosticsTable'
import { useEcolifeDiagnostics, useEcolifeMutations } from '@/modules/ecolife/hooks/useEcolifeData'
import type { EcolifeDiagnostic, EcolifeProduct } from '@/modules/ecolife/types/ecolifeTypes'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

export const EcolifePage = () => {
  const ts = useTranslationService()
  const { data = [], isLoading } = useEcolifeDiagnostics()
  const mutations = useEcolifeMutations()
  const [product, setProduct] = useState<EcolifeProduct>('SWINE')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<EcolifeDiagnostic | null>(null)
  const [removing, setRemoving] = useState<EcolifeDiagnostic | null>(null)
  const start = (next: EcolifeProduct) => {
    setProduct(next)
    setEditing(null)
    setOpen(true)
  }
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Spa color="success" />
        <Typography variant="h4">{ts('ecolife.title')}</Typography>
      </Stack>
      <Alert severity="success">{ts('ecolife.info')}</Alert>
      <EcolifeDashboard rows={data} />
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
          <Button fullWidth size="large" startIcon={<Agriculture />} onClick={() => start('SWINE')}>
            {ts('ecolife.buttons.swine')}
          </Button>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
          <Button fullWidth size="large" startIcon={<Egg />} onClick={() => start('POULTRY')}>
            {ts('ecolife.buttons.poultry')}
          </Button>
        </Paper>
      </Stack>
      {isLoading ? (
        <Typography>{ts('ecolife.loading')}</Typography>
      ) : (
        <EcolifeDiagnosticsTable
          rows={data}
          onEdit={(item) => {
            setProduct(item.product)
            setEditing(item)
            setOpen(true)
          }}
          onDelete={setRemoving}
        />
      )}
      <EcolifeDiagnosticDialog
        key={`${product}-${editing?.id || 'new'}`}
        open={open}
        product={product}
        editing={editing}
        onClose={() => setOpen(false)}
        onSave={async (form) => {
          if (editing) await mutations.update.mutateAsync({ id: editing.id, form })
          else await mutations.create.mutateAsync(form)
          setOpen(false)
        }}
      />
      <Dialog open={Boolean(removing)} onClose={() => setRemoving(null)}>
        <DialogTitle>{ts('ecolife.actions.delete')}</DialogTitle>
        <DialogContent>
          {ts('ecolife.actions.deleteConfirm', { code: removing?.code || '' })}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoving(null)}>{ts('actions.cancel')}</Button>
          <Button
            color="error"
            onClick={async () => {
              if (removing) await mutations.remove.mutateAsync(removing)
              setRemoving(null)
            }}
          >
            {ts('actions.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
