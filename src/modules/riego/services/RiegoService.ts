import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore'
import { firestoreDb } from '@/firebase/app'
import { RIEGO_COLLECTIONS, RIEGO_STORAGE } from '@/modules/riego/models/riegoModels'
import type { RiegoLevantamento, RiegoLevantamentoForm } from '@/modules/riego/types/riegoTypes'
import { appendTimeline, buildCodigo, createTimelineEvent, makeId, nowIso } from '@/modules/riego/utils/riegoUtils'
import { WorkflowService } from '@/shared/workflow/WorkflowService'
import { WORKFLOW_STATUS } from '@/shared/workflow/WorkflowTypes'

const buildActor = (name: string) => ({
  id: `riego-${name.toLowerCase().replace(/\s+/g, '-')}`,
  name,
  role: 'COMERCIAL' as const,
})

const persistLocal = (value: RiegoLevantamento[]) => {
  localStorage.setItem(RIEGO_STORAGE.cacheLevantamentos, JSON.stringify(value))
}

const readLocal = (): RiegoLevantamento[] => {
  const raw = localStorage.getItem(RIEGO_STORAGE.cacheLevantamentos)
  if (!raw) return []
  try {
    return JSON.parse(raw) as RiegoLevantamento[]
  } catch {
    return []
  }
}

const listRemote = async (): Promise<RiegoLevantamento[]> => {
  if (!firestoreDb) return []
  const snap = await getDocs(
    query(collection(firestoreDb, RIEGO_COLLECTIONS.levantamentos), orderBy('updatedAt', 'desc'))
  )

  return snap.docs.map((item) => ({
    id: item.id,
    ...(item.data() as Omit<RiegoLevantamento, 'id'>),
  }))
}

const upsertRemote = async (item: RiegoLevantamento) => {
  if (!firestoreDb) return
  await setDoc(doc(firestoreDb, RIEGO_COLLECTIONS.levantamentos, item.id), item, { merge: true })
}

/**
 * Serviço principal de Levantamentos RIEGO.
 * Toda regra de negocio e persistencia fica centralizada aqui.
 */
export const RiegoService = {
  async list(): Promise<RiegoLevantamento[]> {
    const remote = await listRemote()
    if (remote.length > 0) {
      persistLocal(remote)
      return remote
    }
    return readLocal()
  },

  async create(payload: RiegoLevantamentoForm, actor: string): Promise<RiegoLevantamento> {
    const current = await this.list()
    const now = nowIso()
    const created: RiegoLevantamento = {
      id: makeId(),
      codigo: buildCodigo(current),
      ...payload,
      timeline: [
        createTimelineEvent('CRIADO', 'Levantamento criado no modulo RIEGO.', actor),
      ],
      createdAt: now,
      updatedAt: now,
    }

    await upsertRemote(created)
    persistLocal([created, ...current])

    const workflowActor = buildActor(actor)

    await WorkflowService.ensureWorkflow({
      projetoId: created.id,
      tipo: 'A',
      actor: workflowActor,
      initialStatus: WORKFLOW_STATUS.LEVANTAMENTO,
      codigoOficial: created.codigo,
    })

    await WorkflowService.upsertOperationalStage({
      projetoId: created.id,
      tipo: 'A',
      actor: workflowActor,
      status: WORKFLOW_STATUS.LEVANTAMENTO,
      responsavel: created.responsavel,
      prazo: created.updatedAt,
      comentario: created.observacoes || 'Levantamento RIEGO registrado.',
      checklist: [
        { label: 'Questionario preenchido', done: Object.keys(created.questionnaire).length > 0 },
        { label: 'Coordenadas GPS informadas', done: Boolean(created.gpsLat && created.gpsLng) },
      ],
    })

    return created
  },

  async update(id: string, payload: RiegoLevantamentoForm, actor: string): Promise<RiegoLevantamento> {
    const current = await this.list()
    const base = current.find((item) => item.id === id)
    if (!base) throw new Error('Levantamento nao encontrado')

    const updated: RiegoLevantamento = {
      ...base,
      ...payload,
      timeline: appendTimeline(
        base.timeline,
        createTimelineEvent('ATUALIZADO', 'Levantamento atualizado.', actor)
      ),
      updatedAt: nowIso(),
    }

    await upsertRemote(updated)
    persistLocal(current.map((item) => (item.id === id ? updated : item)))

    await WorkflowService.upsertOperationalStage({
      projetoId: updated.id,
      tipo: 'A',
      actor: buildActor(actor),
      status: WORKFLOW_STATUS.LEVANTAMENTO,
      responsavel: updated.responsavel,
      prazo: updated.updatedAt,
      comentario: 'Levantamento RIEGO atualizado.',
    })

    return updated
  },

  async remove(id: string): Promise<void> {
    const current = await this.list()
    const next = current.filter((item) => item.id !== id)
    persistLocal(next)

    if (firestoreDb) {
      await deleteDoc(doc(firestoreDb, RIEGO_COLLECTIONS.levantamentos, id))
    }
  },

  async sendToEngineering(id: string, actor: string): Promise<RiegoLevantamento> {
    const current = await this.list()
    const found = current.find((item) => item.id === id)
    if (!found) throw new Error('Levantamento nao encontrado')

    const updated: RiegoLevantamento = {
      ...found,
      status: 'ENVIADO_ENGENHARIA',
      timeline: appendTimeline(
        found.timeline,
        createTimelineEvent('ENVIADO_ENGENHARIA', 'Levantamento enviado para Engenharia.', actor)
      ),
      updatedAt: nowIso(),
    }

    await upsertRemote(updated)
    persistLocal(current.map((item) => (item.id === id ? updated : item)))

    await WorkflowService.transitionStatus({
      projetoId: updated.id,
      tipo: 'A',
      actor: buildActor(actor),
      toStatus: WORKFLOW_STATUS.AGUARDANDO_ENGENHARIA,
      observacao: 'Levantamento RIEGO enviado para Engenharia.',
      acao: 'ENVIO_ENGENHARIA',
      codigoOficial: updated.codigo,
    })

    return updated
  },

  saveDraft(data: RiegoLevantamentoForm) {
    localStorage.setItem(RIEGO_STORAGE.draftForm, JSON.stringify(data))
  },

  loadDraft(): RiegoLevantamentoForm | null {
    const raw = localStorage.getItem(RIEGO_STORAGE.draftForm)
    if (!raw) return null
    try {
      return JSON.parse(raw) as RiegoLevantamentoForm
    } catch {
      return null
    }
  },

  clearDraft() {
    localStorage.removeItem(RIEGO_STORAGE.draftForm)
  },
}
