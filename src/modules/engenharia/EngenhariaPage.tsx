import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useMemo, useState } from 'react'
import { EngenhariaDashboard } from '@/modules/engenharia/components/EngenhariaDashboard'
import { EngenhariaProjectDialog } from '@/modules/engenharia/components/EngenhariaProjectDialog'
import { EngenhariaProjectsTable } from '@/modules/engenharia/components/EngenhariaProjectsTable'
import { useEngenhariaDashboard, useEngenhariaMutations } from '@/modules/engenharia/hooks/useEngenhariaData'
import type { EngenhariaProject } from '@/modules/engenharia/types/engenhariaTypes'

export const EngenhariaPage = () => {
  const { data = [], isLoading, dashboard } = useEngenhariaDashboard()
  const {
    create,
    update,
    remove,
    createRevision,
    sendToBudget,
    processManagerApproval,
    saveMemorial,
    uploadFiles,
  } = useEngenhariaMutations()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<EngenhariaProject | null>(null)
  const [removeTarget, setRemoveTarget] = useState<EngenhariaProject | null>(null)
  const [revisionTarget, setRevisionTarget] = useState<EngenhariaProject | null>(null)
  const [revisionReason, setRevisionReason] = useState('')

  const recebidos = useMemo(
    () => data.filter((item) => item.status === 'AGUARDANDO ENGENHARIA'),
    [data]
  )

  return (
    <Stack spacing={2}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">RIAGRO ENGENHARIA</Typography>
      </Stack>

      <Alert severity="info">
        Fluxo tecnico: Cliente -&gt; Visita -&gt; Levantamento -&gt; Projeto -&gt; Memorial -&gt; Aprovacao -&gt; Orcamento.
      </Alert>

      <EngenhariaDashboard metrics={dashboard} />

      <Typography variant="h6">Projetos recebidos</Typography>
      <Typography color="text.secondary">Aguardando Engenharia: {recebidos.length}</Typography>

      <EngenhariaProjectsTable
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
        onCreateRevision={(row) => {
          setRevisionTarget(row)
          setRevisionReason('')
        }}
        onSendBudget={async (row) => {
          await sendToBudget.mutateAsync(row.id)
        }}
      />

      <EngenhariaProjectDialog
        open={dialogOpen}
        editing={editing}
        loading={
          create.isPending ||
          update.isPending ||
          uploadFiles.isPending ||
          processManagerApproval.isPending ||
          saveMemorial.isPending
        }
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
        onSaveMemorial={async (id, memorial) => {
          await saveMemorial.mutateAsync({ id, memorial })
        }}
        onApproval={async (id, decision, observacao) => {
          await processManagerApproval.mutateAsync({ id, decision, observacao })
        }}
      />

      <Dialog open={Boolean(removeTarget)} onClose={() => setRemoveTarget(null)}>
        <DialogTitle>Excluir projeto</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Confirma exclusao do projeto {removeTarget?.codigoProjeto}?
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

      <Dialog open={Boolean(revisionTarget)} onClose={() => setRevisionTarget(null)}>
        <DialogTitle>Nova revisao</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Projeto alvo: {revisionTarget?.codigoProjeto}. Informe o motivo da revisao.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Motivo"
            fullWidth
            multiline
            minRows={3}
            value={revisionReason}
            onChange={(event) => setRevisionReason(event.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRevisionTarget(null)}>Cancelar</Button>
          <Button
            variant="contained"
            color="warning"
            onClick={async () => {
              if (!revisionTarget) return
              await createRevision.mutateAsync({
                id: revisionTarget.id,
                motivo: revisionReason || 'Revisao tecnica solicitada',
              })
              setRevisionTarget(null)
            }}
          >
            Criar revisao
          </Button>
        </DialogActions>
      </Dialog>

      {isLoading && <Typography color="text.secondary">Carregando projetos de Engenharia...</Typography>}
    </Stack>
  )
}
