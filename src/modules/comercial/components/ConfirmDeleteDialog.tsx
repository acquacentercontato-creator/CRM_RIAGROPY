import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'

type ConfirmDeleteDialogProps = {
  open: boolean
  title: string
  description: string
  onCancel: () => void
  onConfirm: () => Promise<void>
  loading?: boolean
}

export const ConfirmDeleteDialog = ({
  open,
  title,
  description,
  onCancel,
  onConfirm,
  loading = false,
}: ConfirmDeleteDialogProps) => {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancelar</Button>
        <Button
          color="error"
          variant="contained"
          disabled={loading}
          onClick={async () => {
            await onConfirm()
          }}
        >
          Excluir
        </Button>
      </DialogActions>
    </Dialog>
  )
}
