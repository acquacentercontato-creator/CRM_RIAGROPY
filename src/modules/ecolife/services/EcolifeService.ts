import { ECOLIFE_CACHE } from '@/modules/ecolife/models/ecolifeModels'
import { getEcolifeRepository } from '@/modules/ecolife/repositories/EcolifeRepository'
import type {
  EcolifeActor,
  EcolifeDiagnostic,
  EcolifeDiagnosticForm,
  EcolifeProduct,
  EcolifeTimelineEvent,
} from '@/modules/ecolife/types/ecolifeTypes'

const readLocal = (product: EcolifeProduct): EcolifeDiagnostic[] => {
  try {
    return JSON.parse(localStorage.getItem(ECOLIFE_CACHE[product]) || '[]') as EcolifeDiagnostic[]
  } catch {
    return []
  }
}
const writeLocal = (product: EcolifeProduct, rows: EcolifeDiagnostic[]) =>
  localStorage.setItem(ECOLIFE_CACHE[product], JSON.stringify(rows))
const now = () => new Date().toISOString()
const makeId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`

export const EcolifeService = {
  async list(product: EcolifeProduct) {
    const remote = await getEcolifeRepository(product).findAll()
    if (remote.length) writeLocal(product, remote)
    return remote.length ? remote : readLocal(product)
  },
  async listAll() {
    return [...(await this.list('SWINE')), ...(await this.list('POULTRY'))]
  },
  async create(payload: EcolifeDiagnosticForm, actor: EcolifeActor) {
    const current = await this.list(payload.product)
    const timestamp = now()
    const base: Omit<EcolifeDiagnostic, 'id'> = {
      ...payload,
      code: `ECO-${payload.product === 'SWINE' ? 'S' : 'P'}-${String(current.length + 1).padStart(4, '0')}`,
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: actor.id,
      updatedBy: actor.id,
      timeline: [
        { id: makeId(), action: 'CREATED', status: payload.status, createdAt: timestamp, actorName: actor.name },
      ],
    }
    let created: EcolifeDiagnostic
    try {
      created = await getEcolifeRepository(payload.product).create(base)
    } catch {
      created = { id: makeId(), ...base }
    }
    writeLocal(payload.product, [created, ...current])
    return created
  },
  async update(id: string, payload: EcolifeDiagnosticForm, actor: EcolifeActor) {
    const current = await this.list(payload.product)
    const found = current.find((item) => item.id === id)
    if (!found) throw new Error('ecolife.errors.notFound')
    const timestamp = now()
    const updated: EcolifeDiagnostic = {
      ...found,
      ...payload,
      updatedAt: timestamp,
      updatedBy: actor.id,
      timeline: [
        ...found.timeline,
        { id: makeId(), action: 'EDITED', status: payload.status, createdAt: timestamp, actorName: actor.name },
        ...(found.status === payload.status ? [] : [{ id: makeId(), action: 'STATUS_CHANGED' as const, status: payload.status, createdAt: timestamp, actorName: actor.name }]),
      ],
    }
    const { id: _id, ...changes } = updated
    void _id
    try {
      await getEcolifeRepository(payload.product).update(id, changes)
    } catch {
      /* offline cache */
    }
    writeLocal(
      payload.product,
      current.map((item) => (item.id === id ? updated : item))
    )
    return updated
  },
  async remove(item: EcolifeDiagnostic) {
    const current = await this.list(item.product)
    try {
      await getEcolifeRepository(item.product).remove(item.id)
    } catch {
      /* offline cache */
    }
    writeLocal(
      item.product,
      current.filter((row) => row.id !== item.id)
    )
  },
  async duplicate(item: EcolifeDiagnostic, actor: EcolifeActor) {
    return this.create(
      {
        product: item.product,
        clientId: item.clientId,
        clientName: item.clientName,
        propertyName: item.propertyName,
        municipality: item.municipality,
        department: item.department,
        consultantName: item.consultantName,
        status: 'LEVANTAMENTO',
        expectedRevenue: item.expectedRevenue,
        answers: { ...item.answers },
        observations: item.observations,
      },
      actor
    )
  },
  async logAction(item: EcolifeDiagnostic, action: EcolifeTimelineEvent['action'], actor: EcolifeActor) {
    const current = await this.list(item.product)
    const found = current.find((row) => row.id === item.id)
    if (!found) return
    const updated: EcolifeDiagnostic = {
      ...found,
      timeline: [...found.timeline, { id: makeId(), action, status: found.status, createdAt: now(), actorName: actor.name }],
    }
    const { id: _id, ...changes } = updated
    void _id
    try { await getEcolifeRepository(item.product).update(item.id, changes) } catch { /* offline cache */ }
    writeLocal(item.product, current.map((row) => (row.id === item.id ? updated : row)))
  },
}
