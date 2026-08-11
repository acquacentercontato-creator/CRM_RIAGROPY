import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import type { MenuPermissionKey } from '@/shared/auth/Permission'
import { PermissionService } from '@/shared/auth/PermissionService'

type PermissionRouteProps = {
  permission: MenuPermissionKey
}

export const PermissionRoute = ({ permission }: PermissionRouteProps) => {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!PermissionService.canSeeModule(user.role, permission)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}