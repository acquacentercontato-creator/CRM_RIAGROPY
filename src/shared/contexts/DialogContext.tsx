import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { PropsWithChildren, ReactNode } from 'react'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

type DialogOptions = {
  title: string
  content: ReactNode
}

type ConfirmOptions = {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
}

type DialogContextType = {
  openDialog: (options: DialogOptions) => void
  closeDialog: () => void
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const DialogContext = createContext<DialogContextType | null>(null)

export const DialogProvider = ({ children }: PropsWithChildren) => {
  const ts = useTranslationService()
  const [dialogOptions, setDialogOptions] = useState<DialogOptions | null>(null)
  const [confirmState, setConfirmState] = useState<
    (ConfirmOptions & { resolve: (value: boolean) => void }) | null
  >(null)

  const openDialog = useCallback((options: DialogOptions) => {
    setDialogOptions(options)
  }, [])

  const closeDialog = useCallback(() => {
    setDialogOptions(null)
  }, [])

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ ...options, resolve })
    })
  }, [])

  const value = useMemo(
    () => ({
      openDialog,
      closeDialog,
      confirm,
    }),
    [openDialog, closeDialog, confirm]
  )

  return (
    <DialogContext.Provider value={value}>
      {children}

      <Dialog open={Boolean(dialogOptions)} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{dialogOptions?.title}</DialogTitle>
        <DialogContent>{dialogOptions?.content}</DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>{ts('actions.close')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(confirmState)} onClose={() => setConfirmState(null)}>
        <DialogTitle>{confirmState?.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmState?.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              confirmState?.resolve(false)
              setConfirmState(null)
            }}
          >
            {confirmState?.cancelLabel || ts('actions.cancel')}
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              confirmState?.resolve(true)
              setConfirmState(null)
            }}
          >
            {confirmState?.confirmLabel || ts('actions.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </DialogContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useDialog = () => {
  const context = useContext(DialogContext)
  if (!context) throw new Error('useDialog deve ser usado dentro de DialogProvider')
  return context
}
