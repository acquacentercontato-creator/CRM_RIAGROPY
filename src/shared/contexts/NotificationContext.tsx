import { Alert, Snackbar } from '@mui/material'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'

type NotificationType = 'success' | 'info' | 'warning' | 'error'

type NotificationContextType = {
  notify: (message: string, type?: NotificationType) => void
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export const NotificationProvider = ({ children }: PropsWithChildren) => {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [type, setType] = useState<NotificationType>('info')

  const notify = useCallback((nextMessage: string, nextType: NotificationType = 'info') => {
    setMessage(nextMessage)
    setType(nextType)
    setOpen(true)
  }, [])

  const value = useMemo(() => ({ notify }), [notify])

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Snackbar open={open} autoHideDuration={3500} onClose={() => setOpen(false)}>
        <Alert severity={type} variant="filled" onClose={() => setOpen(false)}>
          {message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) throw new Error('useNotification deve ser usado dentro de NotificationProvider')
  return context
}
