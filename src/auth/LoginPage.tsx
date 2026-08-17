import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowForwardRounded,
  LockOutlined,
  PersonOutlineRounded,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import agricultureBackground from '@/assets/login-agriculture.webp'
import riagroLogo from '@/assets/logo-riagro.png'
import { useAuth } from './AuthContext'

const USERS = [
  {
    id: 'cleiton',
    name: 'Cleiton Pertile',
    email: 'cleitonpertile@riagro.com',
  },
  {
    id: 'jonas',
    name: 'Jonas Maia',
    email: 'jonasmaia@riagro.com',
  },
  {
    id: 'casemiro',
    name: 'Casemiro Norio',
    email: 'casemironorio@riagro.com',
  },
  {
    id: 'projetista',
    name: 'Projetista RIAGRO',
    email: 'projetista@riagro.com',
  },
] as const

const loginSchema = z.object({
  userId: z.string().min(1, 'Selecione um usuário.'),
  password: z.string().min(6, 'Informe sua senha.'),
})

type LoginFormValues = z.infer<typeof loginSchema>

const getInitialUser = () => {
  const lastEmail = localStorage.getItem('last-user')
  return USERS.find((user) => user.email === lastEmail)?.id ?? ''
}

export const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userId: getInitialUser(),
      password: '',
    },
  })

  const onSubmit = async ({ userId, password }: LoginFormValues) => {
    const selectedUser = USERS.find((user) => user.id === userId)
    if (!selectedUser) {
      setError('userId', { message: 'Selecione um usuário.' })
      return
    }

    const emailSelecionado = selectedUser.email

    try {
      await login(emailSelecionado, password)
      localStorage.setItem('last-user', emailSelecionado)
      navigate('/')
    } catch (error) {
      setError('password', {
        message: error instanceof Error ? error.message : 'Não foi possível entrar no CRM.',
      })
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        px: 2,
        py: 4,
        backgroundImage: `linear-gradient(135deg, rgba(3,35,20,.9), rgba(10,91,51,.67)), url(${agricultureBackground})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        '@keyframes loginEntrance': {
          from: { opacity: 0, transform: 'translateY(18px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 20% 10%, rgba(177,219,128,.18), transparent 32%), linear-gradient(180deg, transparent 60%, rgba(2,24,14,.38))',
        },
      }}
    >
      <Stack
        spacing={3}
        sx={{
          width: '100%',
          maxWidth: 470,
          position: 'relative',
          zIndex: 1,
          animation: 'loginEntrance 650ms ease-out both',
        }}
      >
        <Stack spacing={0.8} sx={{ alignItems: 'center', color: 'common.white' }}>
          <Box
            component="img"
            src={riagroLogo}
            alt="Logo RIAGRO"
            sx={{ width: 150, maxHeight: 74, objectFit: 'contain' }}
          />
          <Typography
            component="h1"
            sx={{ fontSize: { xs: 30, sm: 36 }, fontWeight: 800, letterSpacing: 3.5 }}
          >
            RIAGRO CRM
          </Typography>
          <Typography sx={{ fontSize: { xs: 13, sm: 15 }, opacity: 0.88, letterSpacing: 0.6 }}>
            Tecnología que impulsa el agronegocio
          </Typography>
        </Stack>

        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: '1px solid rgba(255,255,255,.3)',
            boxShadow: '0 28px 70px rgba(0,25,13,.32)',
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
            <Stack component="form" spacing={3} onSubmit={handleSubmit(onSubmit)}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 750, color: '#153d2a' }}>
                  Bem-vindo
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.7 }}>
                  Selecione seu usuário e informe sua senha.
                </Typography>
              </Box>

              <Controller
                name="userId"
                control={control}
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={Boolean(fieldState.error)}>
                    <InputLabel id="user-select-label">Usuário</InputLabel>
                    <Select
                      {...field}
                      labelId="user-select-label"
                      label="Usuário"
                      startAdornment={
                        <InputAdornment position="start">
                          <PersonOutlineRounded color="action" />
                        </InputAdornment>
                      }
                    >
                      {USERS.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {fieldState.error && (
                      <FormHelperText>{fieldState.error.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />

              <Controller
                name="password"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    type={showPassword ? 'text' : 'password'}
                    label="Senha"
                    autoComplete="current-password"
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlined color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                              onClick={() => setShowPassword((visible) => !visible)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                )}
              />

              {isSubmitting && <Alert severity="info">Autenticando com segurança...</Alert>}

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting}
                endIcon={
                  isSubmitting ? (
                    <CircularProgress size={19} color="inherit" />
                  ) : (
                    <ArrowForwardRounded />
                  )
                }
                sx={{
                  minHeight: 54,
                  borderRadius: 2.2,
                  bgcolor: '#176e3e',
                  fontWeight: 800,
                  letterSpacing: 1.3,
                  boxShadow: '0 12px 24px rgba(23,110,62,.24)',
                  '&:hover': { bgcolor: '#0f5a31' },
                }}
              >
                ENTRAR
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Typography align="center" variant="caption" sx={{ color: 'rgba(255,255,255,.78)' }}>
          RIAGRO CRM · Acesso corporativo seguro
        </Typography>
      </Stack>
    </Box>
  )
}
