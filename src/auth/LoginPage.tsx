import { zodResolver } from '@hookform/resolvers/zod'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from './AuthContext'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMINISTRADOR', 'GERENTE', 'PROJETISTA', 'COMERCIAL']),
})

type LoginFormValues = z.infer<typeof loginSchema>

export const LoginPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { login, roles } = useAuth()

  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'usuario@riagro.com',
      password: '123456',
      role: 'COMERCIAL',
    },
  })

  const onSubmit = (values: LoginFormValues) => {
    login({ email: values.email, role: values.role })
    navigate('/')
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        p: 2,
        background:
          'radial-gradient(circle at 10% 20%, rgba(23,110,62,0.18), transparent 40%), radial-gradient(circle at 90% 80%, rgba(209,127,0,0.16), transparent 35%)',
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 460 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={2.5} component="form" onSubmit={handleSubmit(onSubmit)}>
            <Typography variant="h4">{t('auth.welcome')}</Typography>
            <Typography color="text.secondary">{t('auth.subtitle')}</Typography>
            <Alert severity="info">{t('auth.helper')}</Alert>

            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t('auth.email')}
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                  fullWidth
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="password"
                  label={t('auth.password')}
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                  fullWidth
                />
              )}
            />

            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>{t('auth.selectRole')}</InputLabel>
                  <Select {...field} label={t('auth.selectRole')}>
                    {roles.map((role) => (
                      <MenuItem key={role} value={role}>
                        {t(`auth.roles.${role}`)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />

            <Button type="submit" variant="contained" size="large">
              {t('actions.login')}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
