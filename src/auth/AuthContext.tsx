import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import type { AppRole, AuthUser } from '@/shared/types/auth'
import { APP_ROLES } from '@/shared/types/auth'
import { firebaseAuth, firestoreDb } from '@/firebase/app'

type AuthContextType = {
  user: AuthUser | null
  roles: readonly AppRole[]
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)
const sanitizeEmail = (email: string) => email.trim().toLowerCase()

type UserDocument = {
  name?: string
  nome?: string
  email?: string
  role?: string
  perfil?: string
}

const normalizeRole = (value: unknown): AppRole | null => {
  if (typeof value !== 'string') return null
  const normalized = value.trim().toUpperCase()
  if (normalized === 'ADMIN' || normalized === 'ADMINISTRADOR') return 'ADMINISTRADOR'
  return APP_ROLES.includes(normalized as AppRole) ? (normalized as AppRole) : null
}

const loadUserDocument = async (firebaseUser: FirebaseUser): Promise<UserDocument> => {
  if (!firestoreDb) throw new Error('Firestore indisponível')

  const byUid = await getDoc(doc(firestoreDb, 'users', firebaseUser.uid))
  if (byUid.exists()) return byUid.data() as UserDocument

  throw new Error('Usuário não cadastrado na coleção users')
}

const toAuthUser = async (firebaseUser: FirebaseUser): Promise<AuthUser> => {
  const profile = await loadUserDocument(firebaseUser)
  const email = sanitizeEmail(firebaseUser.email || profile.email || '')
  const role = normalizeRole(profile.role ?? profile.perfil)
  if (!role) throw new Error('Perfil inválido na coleção users')

  return {
    id: firebaseUser.uid,
    name: profile.name || profile.nome || firebaseUser.displayName || email,
    email,
    role,
  }
}

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [initializing, setInitializing] = useState(Boolean(firebaseAuth))

  useEffect(() => {
    if (!firebaseAuth) return

    return onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      try {
        setUser(firebaseUser ? await toAuthUser(firebaseUser) : null)
      } catch {
        setUser(null)
      } finally {
        setInitializing(false)
      }
    })
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    if (!firebaseAuth) throw new Error('Firebase Authentication indisponível')

    const normalizedEmail = sanitizeEmail(email)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      throw new Error('E-mail inválido')
    }

    const credential = await signInWithEmailAndPassword(firebaseAuth, normalizedEmail, password)
    setUser(await toAuthUser(credential.user))
  }, [])

  const logout = useCallback(async () => {
    if (firebaseAuth) await signOut(firebaseAuth)
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, roles: APP_ROLES, login, logout }), [user, login, logout])

  if (initializing) return null
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
