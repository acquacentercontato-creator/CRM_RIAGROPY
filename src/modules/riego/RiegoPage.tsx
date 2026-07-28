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
import { useState } from 'react'
import type { RiegoLevantamento } from '@/modules/riego/types/riegoTypes'
import { useRiegoLevantamentos, useRiegoMutations } from '@/modules/riego/hooks/useRiegoData'
import { RiegoLevantamentoDialog } from '@/modules/riego/components/RiegoLevantamentoDialog'
import { RiegoLevantamentosTable } from '@/modules/riego/components/RiegoLevantamentosTable'

export const RiegoPage = () => {
  const { data = [], isLoading } = useRiegoLevantamentos()
  const { create, update, remove, sendToEngineering, uploadMedia } = useRiegoMutations()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<RiegoLevantamento | null>(null)
  const [removeTarget, setRemoveTarget] = useState<RiegoLevantamento | null>(null)

  return (
    <Stack spacing={2}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">RIAGRO RIEGO</Typography>
      </Stack>

      <Alert severity="info">
        Modulo completo com CRUD de levantamentos, questionarios segmentados, autosave, midia, GPS,
        historico e envio para Engenharia.
      </Alert>

      <RiegoLevantamentosTable
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
        onSend={async (row) => {
          await sendToEngineering.mutateAsync(row.id)
        }}
      />

      <RiegoLevantamentoDialog
        open={dialogOpen}
        editing={editing}
        loading={create.isPending || update.isPending || uploadMedia.isPending}
        onClose={() => setDialogOpen(false)}
        onSubmit={async (payload) => {
          if (editing) {
            await update.mutateAsync({ id: editing.id, payload })
          } else {
            await create.mutateAsync(payload)
          }
        }}
        onUpload={async (files, type) => uploadMedia.mutateAsync({ files, type })}
      />

      <Dialog open={Boolean(removeTarget)} onClose={() => setRemoveTarget(null)}>
        <DialogTitle>Excluir levantamento</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Confirma exclusao do levantamento {removeTarget?.codigo}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveTarget(null)}>Cancelar</Button>
          <Button
            variant="contained"
            color="error"
            onClick={async () => {
              if (!removeTarget) return
              await remove.mutateAsync(removeTarget.id)
              setRemoveTarget(null)
            }}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {isLoading && <Typography color="text.secondary">Carregando levantamentos...</Typography>}
    </Stack>
  )
}
