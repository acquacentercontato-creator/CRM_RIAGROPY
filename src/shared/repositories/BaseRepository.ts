import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore'
import { firestoreDb } from '@/firebase/app'

export class BaseRepository<T extends { id: string }> {
  private readonly collectionName: string

  constructor(collectionName: string) {
    this.collectionName = collectionName
  }

  async findAll(): Promise<T[]> {
    if (!firestoreDb) return []
    const snapshot = await getDocs(query(collection(firestoreDb, this.collectionName), orderBy('createdAt', 'desc')))
    return snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<T, 'id'>) }) as T)
  }

  async create(payload: Omit<T, 'id'>): Promise<T> {
    if (!firestoreDb) {
      throw new Error('Firestore indisponivel para criacao')
    }
    const created = await addDoc(collection(firestoreDb, this.collectionName), payload)
    return { id: created.id, ...(payload as object) } as T
  }

  async update(id: string, payload: Partial<Omit<T, 'id'>>): Promise<void> {
    if (!firestoreDb) {
      throw new Error('Firestore indisponivel para atualizacao')
    }
    await updateDoc(doc(firestoreDb, this.collectionName, id), payload as object)
  }

  async remove(id: string): Promise<void> {
    if (!firestoreDb) {
      throw new Error('Firestore indisponivel para remocao')
    }
    await deleteDoc(doc(firestoreDb, this.collectionName, id))
  }
}
