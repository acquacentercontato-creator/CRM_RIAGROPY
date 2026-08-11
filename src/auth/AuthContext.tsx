import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import type { AppRole, AuthUser } from '@/shared/types/auth'
import { APP_ROLES } from '@/shared/types/auth'
import { TranslationService } from '@/shared/services/TranslationService'

type LoginPayload = {
  role: AppRole
  email: string
}

type AuthContextType = {
  user: AuthUser | null
  roles: readonly AppRole[]
  login: (payload: LoginPayload) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const AUTH_STORAGE_KEY = 'riagro.auth.session.v1'

const sanitizeEmail = (email: string) => email.trim().toLowerCase()

const readInitialUser = (): AuthUser | null => {
  const raw = globalThis.localStorage?.getItem(AUTH_STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as AuthUser
    if (!APP_ROLES.includes(parsed.role)) return null
    if (!parsed.email || !parsed.id) return null
    return {
      ...parsed,
      email: sanitizeEmail(parsed.email),
      name: parsed.name || sanitizeEmail(parsed.email),
    }
  } catch {
    return null
  }
}

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<AuthUser | null>(readInitialUser)

  const login = useCallback(({ role, email }: LoginPayload) => {
    const normalizedEmail = sanitizeEmail(email)

    if (!APP_ROLES.includes(role)) {
      throw new Error(TranslationService.t('errors.invalidRole'))
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      throw new Error(TranslationService.t('errors.invalidEmail'))
    }

    const session: AuthUser = {
      id: `user-${normalizedEmail}`,
      name: normalizedEmail,
      email: normalizedEmail,
      role,
    }

    globalThis.localStorage?.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
    setUser(session)
  }, [])

  const logout = useCallback(() => {
    globalThis.localStorage?.removeItem(AUTH_STORAGE_KEY)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      roles: APP_ROLES,
      login,
      logout,
    }),
    [user, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
