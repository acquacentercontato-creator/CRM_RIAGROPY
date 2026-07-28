import { createContext, useContext, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { createAppTheme, type ThemeMode } from './theme'

type ThemeModeContextType = {
  mode: ThemeMode
  toggleMode: () => void
}

const ThemeModeContext = createContext<ThemeModeContextType | null>(null)

export const ThemeModeProvider = ({ children }: PropsWithChildren) => {
  const [mode, setMode] = useState<ThemeMode>('light')

  const toggleMode = () => {
    setMode((current) => (current === 'light' ? 'dark' : 'light'))
  }

  const value = useMemo(() => ({ mode, toggleMode }), [mode])
  const theme = useMemo(() => createAppTheme(mode), [mode])

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  )
}

export const useThemeMode = () => {
  const context = useContext(ThemeModeContext)

  if (!context) {
    throw new Error('useThemeMode must be used inside ThemeModeProvider')
  }

  return context
}
