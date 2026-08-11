import type { AppRole } from '@/shared/types/auth'
import type { MenuPermissionKey, PermissionKey } from '@/shared/auth/Permission'
import { Permissions } from '@/shared/auth/Permissions'
import { UserRole } from '@/shared/auth/UserRoles'

type RoleLike = AppRole | UserRole | string | null | undefined

const roleAliasMap: Record<string, UserRole> = {
  ADMINISTRADOR: UserRole.ADMIN,
  ADMIN: UserRole.ADMIN,
  GERENTE: UserRole.GERENTE,
  COMERCIAL: UserRole.COMERCIAL,
  PROJETISTA: UserRole.ENGENHARIA,
  ENGENHARIA: UserRole.ENGENHARIA,
  OBRAS: UserRole.OBRAS,
  ASSISTENCIA: UserRole.ASSISTENCIA,
  FINANCEIRO: UserRole.FINANCEIRO,
  VISUALIZADOR: UserRole.VISUALIZADOR,
}

const resolveRole = (role: RoleLike): UserRole | null => {
  if (!role) return null

  const normalized = String(role).trim().toUpperCase()
  if (!normalized) return null

  return roleAliasMap[normalized] ?? null
}

const getPermission = (role: RoleLike) => {
  const resolved = resolveRole(role)
  if (!resolved) return null
  return Permissions[resolved] ?? null
}

const canAccess = (role: RoleLike, key: PermissionKey): boolean => {
  const permission = getPermission(role)
  if (!permission) return false
  return permission[key]
}

const canEdit = (role: RoleLike): boolean => canAccess(role, 'editar')
const canDelete = (role: RoleLike): boolean => canAccess(role, 'excluir')
const canUpload = (role: RoleLike): boolean => canAccess(role, 'upload')
const canDownload = (role: RoleLike): boolean => canAccess(role, 'download')
const canSeeMenu = (role: RoleLike, menu: MenuPermissionKey): boolean => canAccess(role, menu)
const canSeeDashboard = (role: RoleLike): boolean => canAccess(role, 'dashboard')
const canSeeModule = (role: RoleLike, module: MenuPermissionKey): boolean => canAccess(role, module)

export const PermissionService = {
  canAccess,
  canEdit,
  canDelete,
  canUpload,
  canDownload,
  canSeeMenu,
  canSeeDashboard,
  canSeeModule,
  resolveRole,
}
