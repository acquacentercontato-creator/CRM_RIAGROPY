import { Add, Agriculture, ArrowBack, Egg } from '@mui/icons-material'
import {
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
import { AttachmentService } from '@/shared/attachments'
import { EcolifeDashboard } from '@/modules/ecolife/components/EcolifeDashboard'
import { EcolifeDiagnosticDialog } from '@/modules/ecolife/components/EcolifeDiagnosticDialog'
import { EcolifeDiagnosticsTable } from '@/modules/ecolife/components/EcolifeDiagnosticsTable'
import { useEcolifeDiagnostics, useEcolifeMutations } from '@/modules/ecolife/hooks/useEcolifeData'
import { EcolifePdfService } from '@/modules/ecolife/services/EcolifePdfService'
import type { EcolifeDiagnostic, EcolifeProduct } from '@/modules/ecolife/types/ecolifeTypes'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

export const EcolifePage = () => {
  const ts = useTranslationService()
  const { data = [], isLoading } = useEcolifeDiagnostics()
  const mutations = useEcolifeMutations()
  const [product, setProduct] = useState<EcolifeProduct | null>(null)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<EcolifeDiagnostic | null>(null)
  const [removing, setRemoving] = useState<EcolifeDiagnostic | null>(null)
  const start = () => {
    setEditing(null)
    setOpen(true)
  }
  const generateAndAttachReport = async (item: EcolifeDiagnostic) => {
    const file = EcolifePdfService.createFile(item, ts)
    await mutations.logAction.mutateAsync({ item, action: 'PDF_GENERATED' })
    try {
      await AttachmentService.upload({
        arquivo: file,
        nome: item.code,
        tipo: 'PDF',
        categoria: 'TECNICO',
        clienteId: item.clientId,
        clienteNome: item.clientName,
        projetoId: item.id,
        moduloContext: 'ECOLIFE',
        observacoes: ts('ecolife.pdf.autoAttachment'),
        tags: ['ECOLIFE', item.product, item.code],
      })
      await mutations.logAction.mutateAsync({ item, action: 'ATTACHMENT_UPLOADED' })
    } catch {
      // O diagnóstico permanece salvo e o relatório continua disponível para impressão.
    }
    EcolifePdfService.print(item, ts)
  }
  if (!product) {
    return (
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ minHeight: '65vh', alignItems: 'stretch', justifyContent: 'center' }}>
        {(['SWINE', 'POULTRY'] as const).map((item) => (
          <Paper key={item} variant="outlined" sx={{ flex: 1, maxWidth: 520, display: 'grid' }}>
            <Button onClick={() => setProduct(item)} sx={{ minHeight: 360, display: 'flex', flexDirection: 'column', gap: 2, fontSize: '1.5rem' }}>
              {item === 'SWINE' ? <Agriculture sx={{ fontSize: 88 }} /> : <Egg sx={{ fontSize: 88 }} />}
              {ts(`ecolife.buttons.${item === 'SWINE' ? 'swine' : 'poultry'}`)}
            </Button>
          </Paper>
        ))}
      </Stack>
    )
  }
  const productRows = data.filter((item) => item.product === product)
  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { md: 'center' } }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Button startIcon={<ArrowBack />} onClick={() => setProduct(null)}>{ts('ecolife.actions.back')}</Button>
          <Typography variant="h4">{ts(`ecolife.products.${product}`)}</Typography>
        </Stack>
        <Button variant="contained" startIcon={<Add />} onClick={start}>{ts('ecolife.actions.new')}</Button>
      </Stack>
      <EcolifeDashboard rows={productRows} />
      {isLoading ? (
        <Typography>{ts('ecolife.loading')}</Typography>
      ) : (
        <EcolifeDiagnosticsTable
          rows={productRows}
          onEdit={(item) => {
            setEditing(item)
            setOpen(true)
          }}
          onDelete={setRemoving}
          onDuplicate={(item) => mutations.duplicate.mutate(item)}
          onPdf={(item) => mutations.logAction.mutate({ item, action: 'PDF_GENERATED' })}
        />
      )}
      <EcolifeDiagnosticDialog
        key={`${product}-${editing?.id || 'new'}`}
        open={open}
        product={product}
        editing={editing}
        onClose={() => setOpen(false)}
        onSave={async (form) => {
          const saved = editing
            ? await mutations.update.mutateAsync({ id: editing.id, form })
            : await mutations.create.mutateAsync(form)
          await generateAndAttachReport(saved)
          setOpen(false)
        }}
        onAttachmentUploaded={(item) =>
          mutations.logAction.mutate({ item, action: 'ATTACHMENT_UPLOADED' })
        }
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
