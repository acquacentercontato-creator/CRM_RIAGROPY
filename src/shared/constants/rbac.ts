import type { AppRole } from '@/shared/types/auth'

export const RBAC_PERMISSIONS = {
  registros: {
    read: ['ADMINISTRADOR', 'GERENTE', 'PROJETISTA', 'COMERCIAL'],
    create: ['ADMINISTRADOR', 'GERENTE', 'COMERCIAL'],
    update: ['ADMINISTRADOR', 'GERENTE', 'PROJETISTA', 'COMERCIAL'],
    remove: ['ADMINISTRADOR', 'GERENTE'],
    sendEngineering: ['ADMINISTRADOR', 'GERENTE', 'COMERCIAL'],
  },
  arquivos: {
    upload: ['ADMINISTRADOR', 'GERENTE', 'PROJETISTA', 'COMERCIAL'],
    remove: ['ADMINISTRADOR', 'GERENTE'],
  },
} as const

export type PermissionResource = keyof typeof RBAC_PERMISSIONS
export type PermissionAction<T extends PermissionResource> = keyof (typeof RBAC_PERMISSIONS)[T]

export const hasRolePermission = <T extends PermissionResource>(
  role: AppRole | null | undefined,
  resource: T,
  action: PermissionAction<T>
) => {
  if (!role) return false
  const allowed = RBAC_PERMISSIONS[resource][action] as readonly AppRole[]
  return allowed.includes(role)
}
