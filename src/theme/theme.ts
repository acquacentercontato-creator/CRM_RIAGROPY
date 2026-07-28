import { createTheme } from '@mui/material/styles'

export type ThemeMode = 'light' | 'dark'

const baseTypography = {
  fontFamily: ['Montserrat', 'Segoe UI', 'sans-serif'].join(','),
  h1: { fontWeight: 700 },
  h2: { fontWeight: 700 },
  h3: { fontWeight: 700 },
}

export const createAppTheme = (mode: ThemeMode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#176e3e' : '#56b67d',
      },
      secondary: {
        main: mode === 'light' ? '#d17f00' : '#f1b95d',
      },
      background: {
        default: mode === 'light' ? '#f4f6f5' : '#121816',
        paper: mode === 'light' ? '#ffffff' : '#1b2420',
      },
    },
    shape: {
      borderRadius: 12,
    },
    typography: baseTypography,
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  })
