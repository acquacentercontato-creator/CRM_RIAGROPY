import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  setDoc,
  where,
} from 'firebase/firestore'
import { firestoreDb } from '@/firebase/app'
import type { WorkflowModel } from '@/shared/workflow/WorkflowModel'
import type { WorkflowStatus } from '@/shared/workflow/WorkflowTypes'

const WORKFLOW_COLLECTION = 'workflow_instances'
const WORKFLOW_CONFIG_COLLECTION = 'workflow_configs'
const LOCAL_WORKFLOW_KEY = 'riagro.workflow.instances'
const LOCAL_WORKFLOW_CONFIG_KEY = 'riagro.workflow.configs'

const readLocal = <T>(key: string): T[] => {
  const raw = globalThis.localStorage?.getItem(key)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as T[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const writeLocal = <T>(key: string, list: T[]) => {
  globalThis.localStorage?.setItem(key, JSON.stringify(list))
}

type WorkflowConfigRecord = {
  projetoId: string
  flow: WorkflowStatus[]
}

export class WorkflowRepository {
  async list(): Promise<WorkflowModel[]> {
    if (!firestoreDb) {
      return readLocal<WorkflowModel>(LOCAL_WORKFLOW_KEY)
    }

    const snapshot = await getDocs(collection(firestoreDb, WORKFLOW_COLLECTION))
    return snapshot.docs.map(
      (item) => ({ id: item.id, ...(item.data() as Omit<WorkflowModel, 'id'>) }) as WorkflowModel
    )
  }

  async getByProjetoId(projetoId: string): Promise<WorkflowModel | null> {
    if (!firestoreDb) {
      const local = readLocal<WorkflowModel>(LOCAL_WORKFLOW_KEY)
      return local.find((item) => item.projetoId === projetoId) ?? null
    }

    const snapshot = await getDocs(
      query(collection(firestoreDb, WORKFLOW_COLLECTION), where('projetoId', '==', projetoId), limit(1))
    )

    const first = snapshot.docs[0]
    if (!first) return null
    return { id: first.id, ...(first.data() as Omit<WorkflowModel, 'id'>) }
  }

  async save(model: WorkflowModel): Promise<WorkflowModel> {
    if (!firestoreDb) {
      const list = readLocal<WorkflowModel>(LOCAL_WORKFLOW_KEY)
      const next = list.some((item) => item.id === model.id)
        ? list.map((item) => (item.id === model.id ? model : item))
        : [model, ...list]
      writeLocal(LOCAL_WORKFLOW_KEY, next)
      return model
    }

    await setDoc(doc(firestoreDb, WORKFLOW_COLLECTION, model.id), model, { merge: true })
    return model
  }

  async saveFlowConfig(projetoId: string, flow: WorkflowStatus[]) {
    const payload: WorkflowConfigRecord = {
      projetoId,
      flow,
    }

    if (!firestoreDb) {
      const list = readLocal<WorkflowConfigRecord>(LOCAL_WORKFLOW_CONFIG_KEY)
      const next = list.some((item) => item.projetoId === projetoId)
        ? list.map((item) => (item.projetoId === projetoId ? payload : item))
        : [payload, ...list]

      writeLocal(LOCAL_WORKFLOW_CONFIG_KEY, next)
      return
    }

    await setDoc(doc(firestoreDb, WORKFLOW_CONFIG_COLLECTION, projetoId), payload, { merge: true })
  }

  async getFlowConfig(projetoId: string): Promise<WorkflowStatus[] | null> {
    if (!firestoreDb) {
      const list = readLocal<WorkflowConfigRecord>(LOCAL_WORKFLOW_CONFIG_KEY)
      return list.find((item) => item.projetoId === projetoId)?.flow ?? null
    }

    const snapshot = await getDocs(
      query(collection(firestoreDb, WORKFLOW_CONFIG_COLLECTION), where('projetoId', '==', projetoId), limit(1))
    )

    const first = snapshot.docs[0]
    if (!first) return null
    const data = first.data() as WorkflowConfigRecord
    return data.flow ?? null
  }
}
