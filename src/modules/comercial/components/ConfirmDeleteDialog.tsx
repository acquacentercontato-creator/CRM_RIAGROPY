import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

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
  const ts = useTranslationService()

  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{ts('actions.cancel')}</Button>
        <Button
          color="error"
          variant="contained"
          disabled={loading}
          onClick={async () => {
            await onConfirm()
          }}
        >
          {ts('actions.delete')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
