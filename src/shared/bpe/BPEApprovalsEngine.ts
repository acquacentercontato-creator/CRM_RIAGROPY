/**
 * Motor de aprovações — gerencia ciclo de vida de aprovações multi-nível
 */

import { AuditService } from '@/shared/services/AuditService'
import { NotificationService } from '@/shared/services/NotificationService'
import type { AppRole } from '@/shared/types/auth'
import type { BPEApproval, BPEApprovalStatus, BPEApprovalType } from './BPETypes'

const APPROVALS_KEY = 'riagro.bpe.approvals.v2'
const APPROVAL_STORE_KEY = 'riagro.bpe.approval.statuses'

type ApprovalStatusStore = Record<string, Record<BPEApprovalType, BPEApprovalStatus>>

const readList = (): BPEApproval[] => {
  try {
    const raw = globalThis.localStorage?.getItem(APPROVALS_KEY)
    return raw ? (JSON.parse(raw) as BPEApproval[]) : []
  } catch {
    return []
  }
}

const saveList = (list: BPEApproval[]) => {
  globalThis.localStorage?.setItem(APPROVALS_KEY, JSON.stringify(list.slice(0, 500)))
}

const readStatusStore = (): ApprovalStatusStore => {
  try {
    const raw = globalThis.localStorage?.getItem(APPROVAL_STORE_KEY)
    return raw ? (JSON.parse(raw) as ApprovalStatusStore) : {}
  } catch {
    return {}
  }
}

const saveStatusStore = (store: ApprovalStatusStore) => {
  globalThis.localStorage?.setItem(APPROVAL_STORE_KEY, JSON.stringify(store))
}

export const BPEApprovalsEngine = {
  /**
   * Solicitar aprovação para um projeto
   */
  solicitar(params: {
    projetoId: string
    codigoOficial: string
    clienteNome: string
    tipo: BPEApprovalType
    solicitadoPor: string
    etapa?: string
  }): BPEApproval {
    const aprovacao: BPEApproval = {
      id: crypto.randomUUID(),
      projetoId: params.projetoId,
      codigoOficial: params.codigoOficial,
      clienteNome: params.clienteNome,
      tipo: params.tipo,
      status: 'PENDENTE',
      solicitadoEm: new Date().toISOString(),
      solicitadoPor: params.solicitadoPor,
      etapa: params.etapa,
    }

    const list = readList()
    list.unshift(aprovacao)
    saveList(list)

    // Atualizar status store
    const store = readStatusStore()
    if (!store[params.projetoId]) store[params.projetoId] = {} as Record<BPEApprovalType, BPEApprovalStatus>
    store[params.projetoId][params.tipo] = 'PENDENTE'
    saveStatusStore(store)

    NotificationService.create(
      'info',
      `Aprovacao ${params.tipo} solicitada`,
      `${params.codigoOficial}: aprovacao de ${params.tipo} requerida.`,
      { projetoId: params.projetoId, tipo: params.tipo }
    )

    return aprovacao
  },

  /**
   * Responder a uma aprovação (APROVADO ou REPROVADO)
   */
  async responder(params: {
    aprovacaoId: string
    decisao: 'APROVADO' | 'REPROVADO'
    responsavelId: string
    responsavelNome: string
    responsavelRole: AppRole
    observacao?: string
  }): Promise<BPEApproval | null> {
    const list = readList()
    const idx = list.findIndex((a) => a.id === params.aprovacaoId)
    if (idx < 0) return null

    const aprovacao = list[idx]
    const now = new Date().toISOString()

    const updated: BPEApproval = {
      ...aprovacao,
      status: params.decisao,
      responsavelId: params.responsavelId,
      responsavelNome: params.responsavelNome,
      responsavelRole: params.responsavelRole,
      respondidoEm: now,
      observacao: params.observacao,
    }

    list[idx] = updated
    saveList(list)

    // Atualizar status store
    const store = readStatusStore()
    if (!store[aprovacao.projetoId]) store[aprovacao.projetoId] = {} as Record<BPEApprovalType, BPEApprovalStatus>
    store[aprovacao.projetoId][aprovacao.tipo] = params.decisao
    saveStatusStore(store)

    // Notificação
    const nivel = params.decisao === 'APROVADO' ? 'success' : 'warning'
    NotificationService.create(
      nivel,
      `Aprovacao ${params.decisao}`,
      `${aprovacao.codigoOficial}: ${aprovacao.tipo} ${params.decisao} por ${params.responsavelNome}.`,
      { projetoId: aprovacao.projetoId, tipo: aprovacao.tipo }
    )

    // Auditoria
    await AuditService.record({
      id: crypto.randomUUID(),
      userId: params.responsavelId,
      userName: params.responsavelNome,
      role: params.responsavelRole,
      action: 'UPDATE',
      entity: 'bpe_approval',
      entityId: aprovacao.id,
      timestamp: now,
      details: {
        tipo: aprovacao.tipo,
        decisao: params.decisao,
        observacao: params.observacao ?? '',
        projetoId: aprovacao.projetoId,
      },
    })

    return updated
  },

  /**
   * Cancelar aprovação pendente
   */
  cancelar(aprovacaoId: string): void {
    const list = readList()
    const idx = list.findIndex((a) => a.id === aprovacaoId)
    if (idx < 0) return

    list[idx] = { ...list[idx], status: 'CANCELADO' }
    saveList(list)

    const store = readStatusStore()
    if (store[list[idx].projetoId]) {
      store[list[idx].projetoId][list[idx].tipo] = 'CANCELADO'
      saveStatusStore(store)
    }
  },

  /** Lista todas as aprovações pendentes */
  listarPendentes(): BPEApproval[] {
    return readList().filter((a) => a.status === 'PENDENTE')
  },

  /** Lista aprovações de um projeto */
  listarPorProjeto(projetoId: string): BPEApproval[] {
    return readList().filter((a) => a.projetoId === projetoId)
  },

  /** Obtém status de aprovação de um projeto/tipo */
  getStatus(projetoId: string, tipo: BPEApprovalType): BPEApprovalStatus | null {
    return readStatusStore()[projetoId]?.[tipo] ?? null
  },

  /** Verifica se todos os tipos de aprovação foram concedidos */
  todasAprovadas(projetoId: string, tipos: BPEApprovalType[]): boolean {
    const store = readStatusStore()[projetoId] ?? {}
    return tipos.every((t) => store[t] === 'APROVADO')
  },

  /** Retorna métricas de aprovação */
  getMetrics(): { pendentes: number; aprovadas: number; reprovadas: number } {
    const list = readList()
    return {
      pendentes: list.filter((a) => a.status === 'PENDENTE').length,
      aprovadas: list.filter((a) => a.status === 'APROVADO').length,
      reprovadas: list.filter((a) => a.status === 'REPROVADO').length,
    }
  },
}
