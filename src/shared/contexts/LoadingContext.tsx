import { Backdrop, CircularProgress } from '@mui/material'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'

type LoadingContextType = {
  isLoading: boolean
  begin: () => void
  end: () => void
  withLoading: <T>(fn: () => Promise<T>) => Promise<T>
}

const LoadingContext = createContext<LoadingContextType | null>(null)

export const LoadingProvider = ({ children }: PropsWithChildren) => {
  const [counter, setCounter] = useState(0)

  const begin = useCallback(() => {
    setCounter((prev) => prev + 1)
  }, [])

  const end = useCallback(() => {
    setCounter((prev) => Math.max(0, prev - 1))
  }, [])

  const withLoading = useCallback(
    async <T,>(fn: () => Promise<T>) => {
      begin()
      try {
        return await fn()
      } finally {
        end()
      }
    },
    [begin, end]
  )

  const value = useMemo(
    () => ({
      isLoading: counter > 0,
      begin,
      end,
      withLoading,
    }),
    [counter, begin, end, withLoading]
  )

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <Backdrop open={counter > 0} sx={{ zIndex: (theme) => theme.zIndex.drawer + 2 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LoadingContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useLoading = () => {
  const context = useContext(LoadingContext)
  if (!context) throw new Error('useLoading deve ser usado dentro de LoadingProvider')
  return context
}
