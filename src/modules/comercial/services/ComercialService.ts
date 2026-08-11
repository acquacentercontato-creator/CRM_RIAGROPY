import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore'
import { firestoreDb } from '@/firebase/app'
import type { AgendaCompromisso, Cliente, FollowUp, Oportunidade, Visita } from '@/modules/comercial/types'
import type { AgendaFormInput, ClienteFormInput, FollowUpFormInput, OportunidadeFormInput, VisitaFormInput } from './ComercialSchemas'
import { COMERCIAL_COLLECTIONS, COMERCIAL_STORAGE_KEYS } from '@/modules/comercial/models/comercialModels'
import { ComercialStorageService } from './ComercialStorageService'
import { buildOportunidades, makeEntityId, nextCodigoInterno, nowIso } from '@/modules/comercial/utils/comercialUtils'
import { WorkflowService } from '@/shared/workflow/WorkflowService'
import { WORKFLOW_STATUS } from '@/shared/workflow/WorkflowTypes'
import { AutomationService } from '@/shared/crm-automation'

const SYSTEM_ACTOR = {
  id: 'comercial-system',
  name: 'Comercial',
  role: 'COMERCIAL',
} as const

const upsertRemote = async <T extends { id: string }>(collectionName: string, item: T) => {
  if (!firestoreDb) return
  await setDoc(doc(firestoreDb, collectionName, item.id), item, { merge: true })
}

const removeRemote = async (collectionName: string, id: string) => {
  if (!firestoreDb) return
  await deleteDoc(doc(firestoreDb, collectionName, id))
}

const listRemote = async <T extends { id: string }>(collectionName: string): Promise<T[]> => {
  if (!firestoreDb) return []
  const snap = await getDocs(query(collection(firestoreDb, collectionName), orderBy('updatedAt', 'desc')))
  return snap.docs.map((item) => ({ id: item.id, ...(item.data() as Record<string, unknown>) })) as T[]
}

const createRemote = async (
  collectionName: string,
  payload: Record<string, unknown>
): Promise<string | null> => {
  if (!firestoreDb) return null
  const created = await addDoc(collection(firestoreDb, collectionName), payload)
  return created.id
}

export const ComercialService = {
  /** Lista clientes do Firestore com fallback offline local. */
  async listClientes(): Promise<Cliente[]> {
    const remote = await listRemote<Cliente>(COMERCIAL_COLLECTIONS.clientes)
    if (remote.length > 0) {
      ComercialStorageService.persistLocal(COMERCIAL_STORAGE_KEYS.clientes, remote)
      return remote
    }
    return ComercialStorageService.readLocal<Cliente>(COMERCIAL_STORAGE_KEYS.clientes)
  },

  /** Cria cliente com codigo interno incremental e persistencia remota/local. */
  async createCliente(input: ClienteFormInput): Promise<Cliente> {
    const base = await this.listClientes()
    const now = nowIso()
    const payload: Cliente = {
      id: makeEntityId(),
      codigoInterno: nextCodigoInterno(base),
      ...input,
      createdAt: now,
      updatedAt: now,
    }

    const remoteId = await createRemote(COMERCIAL_COLLECTIONS.clientes, payload)
    const finalItem = remoteId ? { ...payload, id: remoteId } : payload
    const next = [finalItem, ...base]
    ComercialStorageService.persistLocal(COMERCIAL_STORAGE_KEYS.clientes, next)
    if (remoteId) {
      await upsertRemote(COMERCIAL_COLLECTIONS.clientes, finalItem)
    }

    await WorkflowService.ensureWorkflow({
      projetoId: finalItem.id,
      tipo: 'A',
      actor: SYSTEM_ACTOR,
      initialStatus: WORKFLOW_STATUS.CLIENTE,
      codigoOficial: finalItem.codigoInterno,
    })

    await WorkflowService.upsertOperationalStage({
      projetoId: finalItem.id,
      tipo: 'A',
      actor: SYSTEM_ACTOR,
      status: WORKFLOW_STATUS.CLIENTE,
      responsavel: finalItem.responsavelComercial || 'COMERCIAL',
      prazo: finalItem.updatedAt,
      comentario: finalItem.observacoes || 'Cliente cadastrado no fluxo operacional.',
      checklist: [
        { label: 'Cadastro do cliente validado', done: true },
        { label: 'Contato principal definido', done: Boolean(finalItem.contatoPrincipal) },
      ],
    })

    // Notificar motor de automação
    AutomationService.notifyStatusChanged({
      entityId: finalItem.id,
      entityType: 'CLIENTE',
      statusAnterior: '',
      statusNovo: finalItem.classificacao ?? 'CLIENTE',
      clienteNome: finalItem.nomeFantasia || finalItem.razaoSocial,
      codigoInterno: finalItem.codigoInterno,
      timestamp: finalItem.createdAt,
    })

    return finalItem
  },

  /** Atualiza cliente existente. */
  async updateCliente(id: string, input: ClienteFormInput): Promise<Cliente> {
    const current = await this.listClientes()
    const found = current.find((item) => item.id === id)
    if (!found) throw new Error('Cliente nao encontrado')

    const updated: Cliente = {
      ...found,
      ...input,
      updatedAt: nowIso(),
    }

    const next = current.map((item) => (item.id === id ? updated : item))
    ComercialStorageService.persistLocal(COMERCIAL_STORAGE_KEYS.clientes, next)
    await upsertRemote(COMERCIAL_COLLECTIONS.clientes, updated)

    await WorkflowService.upsertOperationalStage({
      projetoId: updated.id,
      tipo: 'A',
      actor: SYSTEM_ACTOR,
      status: WORKFLOW_STATUS.CLIENTE,
      responsavel: updated.responsavelComercial || 'COMERCIAL',
      prazo: updated.updatedAt,
      comentario: 'Cadastro de cliente atualizado.',
    })

    return updated
  },

  /** Remove cliente por ID. */
  async deleteCliente(id: string): Promise<void> {
    const current = await this.listClientes()
    const next = current.filter((item) => item.id !== id)
    ComercialStorageService.persistLocal(COMERCIAL_STORAGE_KEYS.clientes, next)
    await removeRemote(COMERCIAL_COLLECTIONS.clientes, id)
  },

  /** Lista compromissos da agenda comercial. */
  async listAgenda(): Promise<AgendaCompromisso[]> {
    const remote = await listRemote<AgendaCompromisso>(COMERCIAL_COLLECTIONS.agenda)
    if (remote.length > 0) {
      ComercialStorageService.persistLocal(COMERCIAL_STORAGE_KEYS.agenda, remote)
      return remote
    }
    return ComercialStorageService.readLocal<AgendaCompromisso>(COMERCIAL_STORAGE_KEYS.agenda)
  },

  /** Cria compromisso da agenda comercial. */
  async createAgenda(input: AgendaFormInput): Promise<AgendaCompromisso> {
    const current = await this.listAgenda()
    const now = nowIso()
    const payload: AgendaCompromisso = {
      id: makeEntityId(),
      ...input,
      createdAt: now,
      updatedAt: now,
    }

    const remoteId = await createRemote(COMERCIAL_COLLECTIONS.agenda, payload)
    const finalItem = remoteId ? { ...payload, id: remoteId } : payload
    const next = [finalItem, ...current]
    ComercialStorageService.persistLocal(COMERCIAL_STORAGE_KEYS.agenda, next)
    if (remoteId) {
      await upsertRemote(COMERCIAL_COLLECTIONS.agenda, finalItem)
    }
    return finalItem
  },

  /** Atualiza compromisso da agenda. */
  async updateAgenda(id: string, input: AgendaFormInput): Promise<AgendaCompromisso> {
    const current = await this.listAgenda()
    const found = current.find((item) => item.id === id)
    if (!found) throw new Error('Compromisso nao encontrado')

    const updated: AgendaCompromisso = {
      ...found,
      ...input,
      updatedAt: nowIso(),
    }

    const next = current.map((item) => (item.id === id ? updated : item))
    ComercialStorageService.persistLocal(COMERCIAL_STORAGE_KEYS.agenda, next)
    await upsertRemote(COMERCIAL_COLLECTIONS.agenda, updated)
    return updated
  },

  /** Exclui compromisso da agenda. */
  async deleteAgenda(id: string): Promise<void> {
    const current = await this.listAgenda()
    const next = current.filter((item) => item.id !== id)
    ComercialStorageService.persistLocal(COMERCIAL_STORAGE_KEYS.agenda, next)
    await removeRemote(COMERCIAL_COLLECTIONS.agenda, id)
  },

  /** Lista visitas comerciais. */
  async listVisitas(): Promise<Visita[]> {
    const remote = await listRemote<Visita>(COMERCIAL_COLLECTIONS.visitas)
    if (remote.length > 0) {
      ComercialStorageService.persistLocal(COMERCIAL_STORAGE_KEYS.visitas, remote)
      return remote
    }
    return ComercialStorageService.readLocal<Visita>(COMERCIAL_STORAGE_KEYS.visitas)
  },

  /** Cria registro de visita comercial. */
  async createVisita(input: VisitaFormInput): Promise<Visita> {
    const current = await this.listVisitas()
    const now = nowIso()
    const payload: Visita = {
      id: makeEntityId(),
      ...input,
      createdAt: now,
      updatedAt: now,
    }

    const remoteId = await createRemote(COMERCIAL_COLLECTIONS.visitas, payload)
    const finalItem = remoteId ? { ...payload, id: remoteId } : payload
    const next = [finalItem, ...current]
    ComercialStorageService.persistLocal(COMERCIAL_STORAGE_KEYS.visitas, next)
    if (remoteId) {
      await upsertRemote(COMERCIAL_COLLECTIONS.visitas, finalItem)
    }

    await WorkflowService.ensureWorkflow({
      projetoId: finalItem.clienteId,
      tipo: 'A',
      actor: SYSTEM_ACTOR,
      initialStatus: WORKFLOW_STATUS.CLIENTE,
      codigoOficial: finalItem.clienteId,
    })

    await WorkflowService.transitionStatus({
      projetoId: finalItem.clienteId,
      tipo: 'A',
      actor: {
        id: `visitante-${finalItem.responsavel}`,
        name: finalItem.responsavel,
        role: 'COMERCIAL',
      },
      toStatus: WORKFLOW_STATUS.VISITA,
      observacao: finalItem.resultado || finalItem.objetivo,
      acao: 'REGISTRO_VISITA',
      codigoOficial: finalItem.clienteId,
    })

    await WorkflowService.upsertOperationalStage({
      projetoId: finalItem.clienteId,
      tipo: 'A',
      actor: {
        id: `visitante-${finalItem.responsavel}`,
        name: finalItem.responsavel,
        role: 'COMERCIAL',
      },
      status: WORKFLOW_STATUS.VISITA,
      responsavel: finalItem.responsavel,
      prazo: `${finalItem.data}T${finalItem.hora || '00:00'}:00.000Z`,
      comentario: finalItem.observacoes || finalItem.resultado,
      checklist: [
        { label: 'Visita realizada', done: true },
        { label: 'Resultado registrado', done: Boolean(finalItem.resultado) },
      ],
    })

    AutomationService.notifyStatusChanged({
      entityId: finalItem.id,
      entityType: 'VISITA',
      statusAnterior: 'PENDENTE',
      statusNovo: finalItem.resultado ? 'CONCLUIDO' : 'PENDENTE',
      clienteNome: finalItem.clienteNome,
      timestamp: finalItem.createdAt,
    })

    return finalItem
  },

  /** Atualiza visita comercial. */
  async updateVisita(id: string, input: VisitaFormInput): Promise<Visita> {
    const current = await this.listVisitas()
    const found = current.find((item) => item.id === id)
    if (!found) throw new Error('Visita nao encontrada')

    const updated: Visita = {
      ...found,
      ...input,
      updatedAt: nowIso(),
    }

    const next = current.map((item) => (item.id === id ? updated : item))
    ComercialStorageService.persistLocal(COMERCIAL_STORAGE_KEYS.visitas, next)
    await upsertRemote(COMERCIAL_COLLECTIONS.visitas, updated)

    await WorkflowService.upsertOperationalStage({
      projetoId: updated.clienteId,
      tipo: 'A',
      actor: {
        id: `visitante-${updated.responsavel}`,
        name: updated.responsavel,
        role: 'COMERCIAL',
      },
      status: WORKFLOW_STATUS.VISITA,
      responsavel: updated.responsavel,
      prazo: `${updated.data}T${updated.hora || '00:00'}:00.000Z`,
      comentario: 'Visita atualizada no CRM.',
    })

    return updated
  },

  /** Exclui visita comercial. */
  async deleteVisita(id: string): Promise<void> {
    const current = await this.listVisitas()
    const next = current.filter((item) => item.id !== id)
    ComercialStorageService.persistLocal(COMERCIAL_STORAGE_KEYS.visitas, next)
    await removeRemote(COMERCIAL_COLLECTIONS.visitas, id)
  },

  /** Consolida oportunidades de clientes com base no historico de visitas. */
  async listOportunidades(): Promise<Oportunidade[]> {
    // Tenta Firestore primeiro
    const remote = await listRemote<Oportunidade>(COMERCIAL_COLLECTIONS.oportunidades)
    if (remote.length > 0) {
      ComercialStorageService.persistLocal(COMERCIAL_STORAGE_KEYS.oportunidades, remote)
      return remote
    }
    const local = ComercialStorageService.readLocal<Oportunidade>(COMERCIAL_STORAGE_KEYS.oportunidades)
    if (local.length > 0) return local
    // Fallback: derivar do histórico
    const [clientes, visitas] = await Promise.all([this.listClientes(), this.listVisitas()])
    return buildOportunidades(clientes, visitas)
  },

  /** Cria oportunidade de venda. */
  async createOportunidade(input: OportunidadeFormInput): Promise<Oportunidade> {
    const current = await this.listOportunidades()
    const now = nowIso()
    const payload: Oportunidade = {
      id: makeEntityId(),
      statusCliente: 'PROSPECT',
      ultimaVisita: '',
      resultadoUltimaVisita: '',
      ...input,
      nivel: input.nivel,
      etapaFunil: input.etapaFunil ?? 'LEAD',
      createdAt: now,
      updatedAt: now,
    }

    const remoteId = await createRemote(COMERCIAL_COLLECTIONS.oportunidades, payload)
    const finalItem = remoteId ? { ...payload, id: remoteId } : payload
    ComercialStorageService.persistLocal(COMERCIAL_STORAGE_KEYS.oportunidades, [finalItem, ...current])
    if (remoteId) await upsertRemote(COMERCIAL_COLLECTIONS.oportunidades, finalItem)

    AutomationService.notifyStatusChanged({
      entityId: finalItem.id,
      entityType: 'OPORTUNIDADE',
      statusAnterior: '',
      statusNovo: finalItem.etapaFunil ?? 'LEAD',
      clienteNome: finalItem.clienteNome,
      timestamp: finalItem.createdAt ?? nowIso(),
    })

    return finalItem
  },

  /** Atualiza oportunidade (incluindo etapa do funil). */
  async updateOportunidade(id: string, input: Partial<OportunidadeFormInput> & { etapaFunil?: Oportunidade['etapaFunil'] }): Promise<Oportunidade> {
    const current = await this.listOportunidades()
    const found = current.find((item) => item.id === id)
    if (!found) throw new Error('Oportunidade nao encontrada')

    const updated: Oportunidade = {
      ...found,
      ...input,
      updatedAt: nowIso(),
    }

    const next = current.map((item) => (item.id === id ? updated : item))
    ComercialStorageService.persistLocal(COMERCIAL_STORAGE_KEYS.oportunidades, next)
    await upsertRemote(COMERCIAL_COLLECTIONS.oportunidades, updated)

    // Notificar mudança de etapa do funil
    if (input.etapaFunil && input.etapaFunil !== found.etapaFunil) {
      AutomationService.notifyStatusChanged({
        entityId: updated.id,
        entityType: 'OPORTUNIDADE',
        statusAnterior: found.etapaFunil ?? 'LEAD',
        statusNovo: input.etapaFunil,
        clienteNome: updated.clienteNome,
        timestamp: updated.updatedAt ?? nowIso(),
      })
    }

    return updated
  },

  /** Exclui oportunidade. */
  async deleteOportunidade(id: string): Promise<void> {
    const current = await this.listOportunidades()
    const next = current.filter((item) => item.id !== id)
    ComercialStorageService.persistLocal(COMERCIAL_STORAGE_KEYS.oportunidades, next)
    await removeRemote(COMERCIAL_COLLECTIONS.oportunidades, id)
  },

  /** Lista follow-ups. */
  async listFollowUps(): Promise<FollowUp[]> {
    const remote = await listRemote<FollowUp>(COMERCIAL_COLLECTIONS.followups)
    if (remote.length > 0) {
      ComercialStorageService.persistLocal(COMERCIAL_STORAGE_KEYS.followups, remote)
      return remote
    }
    return ComercialStorageService.readLocal<FollowUp>(COMERCIAL_STORAGE_KEYS.followups)
  },

  /** Cria follow-up. */
  async createFollowUp(input: FollowUpFormInput, criadoPor: string): Promise<FollowUp> {
    const current = await this.listFollowUps()
    const payload: FollowUp = {
      id: makeEntityId(),
      ...input,
      criadoEm: nowIso(),
      criadoPor,
    }

    const remoteId = await createRemote(COMERCIAL_COLLECTIONS.followups, payload)
    const finalItem = remoteId ? { ...payload, id: remoteId } : payload
    ComercialStorageService.persistLocal(COMERCIAL_STORAGE_KEYS.followups, [finalItem, ...current])
    if (remoteId) await upsertRemote(COMERCIAL_COLLECTIONS.followups, finalItem)
    return finalItem
  },

  /** Atualiza follow-up. */
  async updateFollowUp(id: string, input: Partial<FollowUpFormInput>): Promise<FollowUp> {
    const current = await this.listFollowUps()
    const found = current.find((item) => item.id === id)
    if (!found) throw new Error('FollowUp nao encontrado')

    const updated: FollowUp = { ...found, ...input }
    const next = current.map((item) => (item.id === id ? updated : item))
    ComercialStorageService.persistLocal(COMERCIAL_STORAGE_KEYS.followups, next)
    await upsertRemote(COMERCIAL_COLLECTIONS.followups, updated)
    return updated
  },

  /** Exclui follow-up. */
  async deleteFollowUp(id: string): Promise<void> {
    const current = await this.listFollowUps()
    const next = current.filter((item) => item.id !== id)
    ComercialStorageService.persistLocal(COMERCIAL_STORAGE_KEYS.followups, next)
    await removeRemote(COMERCIAL_COLLECTIONS.followups, id)
  },
}
