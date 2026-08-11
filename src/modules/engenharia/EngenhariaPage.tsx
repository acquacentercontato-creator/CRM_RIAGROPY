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
import WaterIcon from '@mui/icons-material/Water'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EngenhariaDashboard } from '@/modules/engenharia/components/EngenhariaDashboard'
import { useTranslationService } from '@/shared/hooks/useTranslationService'
import { EngenhariaProjectDialog } from '@/modules/engenharia/components/EngenhariaProjectDialog'
import { EngenhariaProjectsTable } from '@/modules/engenharia/components/EngenhariaProjectsTable'
import { useEngenhariaDashboard, useEngenhariaMutations } from '@/modules/engenharia/hooks/useEngenhariaData'
import type { EngenhariaProject } from '@/modules/engenharia/types/engenhariaTypes'

export const EngenhariaPage = () => {
  const { data = [], isLoading, dashboard } = useEngenhariaDashboard()
  const ts = useTranslationService()
  const navigate = useNavigate()
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
        <Typography variant="h4">{ts('engenharia.title')}</Typography>
        <Button
          variant="outlined"
          startIcon={<WaterIcon />}
          onClick={() => navigate('/engenharia/hidraulica')}
          size="small"
        >
          {ts('hydraulic.title')}
        </Button>
      </Stack>

      <Alert severity="info">{ts('engenharia.info')}</Alert>

      <EngenhariaDashboard metrics={dashboard} />

      <Typography variant="h6">{ts('engenharia.receivedTitle')}</Typography>
      <Typography color="text.secondary">{ts('engenharia.waiting', { count: recebidos.length })}</Typography>

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
        <DialogTitle>{ts('engenharia.deleteProject')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {ts('engenharia.deleteDescription', { codigo: removeTarget?.codigoProjeto || '' })}
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

      <Dialog open={Boolean(revisionTarget)} onClose={() => setRevisionTarget(null)}>
        <DialogTitle>{ts('engenharia.newRevision')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {ts('engenharia.revisionTarget', { codigo: revisionTarget?.codigoProjeto || '' })}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label={ts('engenharia.reason')}
            fullWidth
            multiline
            minRows={3}
            value={revisionReason}
            onChange={(event) => setRevisionReason(event.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRevisionTarget(null)}>{ts('actions.cancel')}</Button>
          <Button
            variant="contained"
            color="warning"
            onClick={async () => {
              if (!revisionTarget) return
              await createRevision.mutateAsync({
                id: revisionTarget.id,
                motivo: revisionReason || ts('engenharia.defaultRevisionReason'),
              })
              setRevisionTarget(null)
            }}
          >
            {ts('engenharia.createRevision')}
          </Button>
        </DialogActions>
      </Dialog>

      {isLoading && <Typography color="text.secondary">{ts('engenharia.loading')}</Typography>}
    </Stack>
  )
}
