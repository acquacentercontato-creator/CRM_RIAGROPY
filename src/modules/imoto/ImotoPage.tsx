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
import { ImotoLevantamentoDialog } from '@/modules/imoto/components/ImotoLevantamentoDialog'
import { ImotoLevantamentosTable } from '@/modules/imoto/components/ImotoLevantamentosTable'
import { useImotoLevantamentos, useImotoMutations } from '@/modules/imoto/hooks/useImotoData'
import type { ImotoLevantamento } from '@/modules/imoto/types/imotoTypes'

export const ImotoPage = () => {
  const { data = [], isLoading } = useImotoLevantamentos()
  const { create, update, remove, sendToEngineering, uploadMedia } = useImotoMutations()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ImotoLevantamento | null>(null)
  const [removeTarget, setRemoveTarget] = useState<ImotoLevantamento | null>(null)

  return (
    <Stack spacing={2}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">RIAGRO IMOTO</Typography>
      </Stack>

      <Alert severity="info">
        Modulo industrial com CRUD de levantamentos, questionarios dinamicos por segmento, uploads,
        GPS, status, historico, timeline e integracao com workflow.
      </Alert>

      <ImotoLevantamentosTable
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

      <ImotoLevantamentoDialog
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
          setDialogOpen(false)
        }}
        onUpload={async (files, category, segment) => {
          return uploadMedia.mutateAsync({ files, category, segment })
        }}
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
