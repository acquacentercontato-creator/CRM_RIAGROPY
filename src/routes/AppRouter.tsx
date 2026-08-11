import { lazy, Suspense } from 'react'
import { Box, CircularProgress } from '@mui/material'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/auth/ProtectedRoute'
import { MainLayout } from '@/layouts/MainLayout'
import { PermissionRoute } from '@/routes/PermissionRoute'

const LoginPage = lazy(() => import('@/auth/LoginPage').then((module) => ({ default: module.LoginPage })))
const DashboardPage = lazy(() =>
  import('@/modules/dashboard/DashboardPage').then((module) => ({ default: module.DashboardPage }))
)
const ClientesPage = lazy(() =>
  import('@/modules/clientes/ClientesPage').then((module) => ({ default: module.ClientesPage }))
)
const AgendaPage = lazy(() => import('@/modules/agenda/AgendaPage').then((module) => ({ default: module.AgendaPage })))
const VisitasPage = lazy(() =>
  import('@/modules/visitas/VisitasPage').then((module) => ({ default: module.VisitasPage }))
)
const OportunidadesPage = lazy(() =>
  import('@/modules/comercial/OportunidadesPage').then((module) => ({ default: module.OportunidadesPage }))
)
const RiegoPage = lazy(() => import('@/modules/riego/RiegoPage').then((module) => ({ default: module.RiegoPage })))
const ImotoPage = lazy(() => import('@/modules/imoto/ImotoPage').then((module) => ({ default: module.ImotoPage })))
const EngenhariaPage = lazy(() =>
  import('@/modules/engenharia/EngenhariaPage').then((module) => ({ default: module.EngenhariaPage }))
)
const HydraulicPage = lazy(() =>
  import('@/modules/engenharia/hydraulic/HydraulicPage').then((module) => ({ default: module.HydraulicPage }))
)
const ObrasPage = lazy(() => import('@/modules/obras/ObrasPage').then((module) => ({ default: module.ObrasPage })))
const AssistenciaPage = lazy(() =>
  import('@/modules/assistencia/AssistenciaPage').then((module) => ({ default: module.AssistenciaPage }))
)
const RelatoriosPage = lazy(() =>
  import('@/modules/administracao/RelatoriosPage').then((module) => ({ default: module.RelatoriosPage }))
)
const AdministracaoPage = lazy(() =>
  import('@/modules/administracao/AdministracaoPage').then((module) => ({ default: module.AdministracaoPage }))
)
const ConfiguracoesPage = lazy(() =>
  import('@/modules/administracao/ConfiguracoesPage').then((module) => ({ default: module.ConfiguracoesPage }))
)

const RouterFallback = () => (
  <Box sx={{ minHeight: '40vh', display: 'grid', placeItems: 'center' }}>
    <CircularProgress size={28} />
  </Box>
)

export const AppRouter = () => {
  return (
    <Suspense fallback={<RouterFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route element={<PermissionRoute permission="dashboard" />}>
              <Route path="/" element={<DashboardPage />} />
            </Route>

            <Route element={<PermissionRoute permission="clientes" />}>
              <Route path="/clientes" element={<ClientesPage />} />
            </Route>

            <Route element={<PermissionRoute permission="agenda" />}>
              <Route path="/agenda" element={<AgendaPage />} />
            </Route>

            <Route element={<PermissionRoute permission="visitas" />}>
              <Route path="/visitas" element={<VisitasPage />} />
            </Route>

            <Route element={<PermissionRoute permission="oportunidades" />}>
              <Route path="/oportunidades" element={<OportunidadesPage />} />
            </Route>

            <Route element={<PermissionRoute permission="riego" />}>
              <Route path="/riego" element={<RiegoPage />} />
            </Route>

            <Route element={<PermissionRoute permission="imoto" />}>
              <Route path="/imoto" element={<ImotoPage />} />
            </Route>

            <Route element={<PermissionRoute permission="engenharia" />}>
              <Route path="/engenharia" element={<EngenhariaPage />} />
              <Route path="/engenharia/hidraulica" element={<HydraulicPage />} />
            </Route>

            <Route element={<PermissionRoute permission="obras" />}>
              <Route path="/obras" element={<ObrasPage />} />
            </Route>

            <Route element={<PermissionRoute permission="assistencia" />}>
              <Route path="/assistencia" element={<AssistenciaPage />} />
            </Route>

            <Route element={<PermissionRoute permission="relatorios" />}>
              <Route path="/relatorios" element={<RelatoriosPage />} />
            </Route>

            <Route element={<PermissionRoute permission="administracao" />}>
              <Route path="/administracao" element={<AdministracaoPage />} />
            </Route>

            <Route element={<PermissionRoute permission="configuracoes" />}>
              <Route path="/configuracoes" element={<ConfiguracoesPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
