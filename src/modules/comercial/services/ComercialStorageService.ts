import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { firebaseStorage } from '@/firebase/app'

const persistLocal = <T>(key: string, value: T[]) => {
  localStorage.setItem(key, JSON.stringify(value))
}

const readLocal = <T>(key: string): T[] => {
  const raw = localStorage.getItem(key)
  if (!raw) return []
  try {
    return JSON.parse(raw) as T[]
  } catch {
    return []
  }
}

/**
 * Serviço de armazenamento do módulo Comercial.
 * Responsável por persistência local e upload para Firebase Storage.
 */
export const ComercialStorageService = {
  /** Persiste uma lista localmente para modo offline. */
  persistLocal,

  /** Lê uma lista persistida localmente para modo offline. */
  readLocal,

  /**
   * Faz upload de arquivo no Firebase Storage e retorna URL pública.
   * Em ambiente sem configuração do Firebase, retorna null.
   */
  async uploadMedia(file: File, folder: string): Promise<string | null> {
    if (!firebaseStorage) return null
    const fileRef = ref(firebaseStorage, `comercial/${folder}/${Date.now()}-${file.name}`)
    await uploadBytes(fileRef, file)
    return getDownloadURL(fileRef)
  },
}
