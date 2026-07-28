import { useMemo } from 'react'
import { useAuth } from '@/auth/AuthContext'
import { hasRolePermission, type PermissionAction, type PermissionResource } from '@/shared/constants/rbac'

export const useRBAC = () => {
  const { user } = useAuth()

  const role = user?.role

  const can = useMemo(
    () =>
      <T extends PermissionResource>(resource: T, action: PermissionAction<T>) =>
        hasRolePermission(role, resource, action),
    [role]
  )

  return {
    role,
    can,
  }
}
