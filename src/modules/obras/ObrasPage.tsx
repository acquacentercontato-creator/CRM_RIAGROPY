import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material'
import { useMemo, useState } from 'react'
import { ObraFormDialog } from '@/modules/obras/components/ObraFormDialog'
import { useTranslationService } from '@/shared/hooks/useTranslationService'
import { ObrasDashboard } from '@/modules/obras/components/ObrasDashboard'
import { ObrasTable } from '@/modules/obras/components/ObrasTable'
import { useObrasDashboard, useObrasMutations } from '@/modules/obras/hooks/useObrasData'
import type { Obra } from '@/modules/obras/types/obrasTypes'
import { OBRAS_STATUS, type ObraStatus } from '@/modules/obras/types/obrasTypes'

export const ObrasPage = () => {
  const { data = [], dashboard, isLoading } = useObrasDashboard()
  const ts = useTranslationService()
  const { create, update, remove, changeStatus, uploadFiles } = useObrasMutations()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Obra | null>(null)
  const [removeTarget, setRemoveTarget] = useState<Obra | null>(null)

  const obrasExecucao = useMemo(
    () => data.filter((item) => item.status === 'EXECUCAO' || item.status === 'ACOMPANHAMENTO').length,
    [data]
  )

  const getNextStatus = (status: ObraStatus): ObraStatus => {
    const index = OBRAS_STATUS.indexOf(status)
    return OBRAS_STATUS[Math.min(index + 1, OBRAS_STATUS.length - 1)]
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">{ts('obras.title')}</Typography>
      </Stack>

      <Alert severity="info">{ts('obras.info')}</Alert>

      <ObrasDashboard metrics={dashboard} />

      <Typography variant="h6">{ts('obras.tracking')}</Typography>
      <Typography color="text.secondary">{ts('obras.inField', { count: obrasExecucao })}</Typography>

      <ObrasTable
        rows={data}
        onCreate={() => {
          setEditing(null)
          setDialogOpen(true)
        }}
        onEdit={(row) => {
          setEditing(row)
          setDialogOpen(true)
        }}
        onDelete={(row) => setRemoveTarget(row)}
        onNextStatus={async (row) => {
          const next = getNextStatus(row.status)
          if (next === row.status) return
          await changeStatus.mutateAsync({ id: row.id, status: next })
        }}
      />

      <ObraFormDialog
        open={dialogOpen}
        editing={editing}
        loading={create.isPending || update.isPending || uploadFiles.isPending}
        onClose={() => setDialogOpen(false)}
        onSubmit={async (payload) => {
          if (editing) {
            await update.mutateAsync({ id: editing.id, payload })
          } else {
            await create.mutateAsync(payload)
          }
          setDialogOpen(false)
        }}
        onUpload={async (id, category, files) => {
          return uploadFiles.mutateAsync({ id, category, files })
        }}
      />

      <Dialog open={Boolean(removeTarget)} onClose={() => setRemoveTarget(null)}>
        <DialogTitle>{ts('obras.deleteWork')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {ts('obras.deleteDescription', { codigo: removeTarget?.codigoObra || '' })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveTarget(null)}>{ts('actions.cancel')}</Button>
          <Button
            variant="contained"
            color="error"
            onClick={async () => {
              if (!removeTarget) return
              await remove.mutateAsync(removeTarget.id)
              setRemoveTarget(null)
            }}
          >
            {ts('actions.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {isLoading && <Typography color="text.secondary">{ts('obras.loading')}</Typography>}
    </Stack>
  )
}
