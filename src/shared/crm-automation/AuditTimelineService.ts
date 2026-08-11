/**
 * AuditTimelineService — serviço unificado de auditoria e timeline CRM
 * Centraliza o histórico de todas as entidades do CRM
 */

import { AuditService } from '@/shared/services/AuditService'
import { TimelineService } from '@/shared/services/TimelineService'
import type { TimelineEvent } from '@/shared/types/core'
import type { AuditLog } from '@/shared/types/core'

export interface CRMAuditEntry {
  entityId: string
  entityType: string
  acao: string
  statusAnterior?: string
  statusNovo?: string
  usuarioId: string
  usuarioNome: string
  timestamp: string
  detalhes?: Record<string, unknown>
}

export interface CRMHistoricoItem {
  id: string
  tipo: 'AUDITORIA' | 'TIMELINE' | 'AUTOMACAO'
  mensagem: string
  timestamp: string
  usuarioNome: string
  statusAnterior?: string
  statusNovo?: string
}

const HISTORY_KEY = 'riagro.crm.historico.unificado'

const readHistory = (): CRMHistoricoItem[] => {
  try {
    const raw = globalThis.localStorage?.getItem(HISTORY_KEY)
    return raw ? (JSON.parse(raw) as CRMHistoricoItem[]) : []
  } catch { return [] }
}

const saveHistory = (items: CRMHistoricoItem[]) => {
  globalThis.localStorage?.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 5000)))
}

export const AuditTimelineService = {
  /**
   * Registra auditoria + entrada na timeline unificada
   */
  async record(entry: CRMAuditEntry): Promise<void> {
    const now = entry.timestamp || new Date().toISOString()

    // 1. Auditoria no Firestore (via AuditService existente)
    const auditLog: AuditLog = {
      id: crypto.randomUUID(),
      userId: entry.usuarioId,
      userName: entry.usuarioNome,
      role: 'COMERCIAL',
      action: 'UPDATE',
      entity: entry.entityType.toLowerCase(),
      entityId: entry.entityId,
      timestamp: now,
      details: {
        acao: entry.acao,
        statusAnterior: entry.statusAnterior,
        statusNovo: entry.statusNovo,
        ...entry.detalhes,
      },
    }
    await AuditService.record(auditLog)

    // 2. Timeline local (via TimelineService existente)
    const timelineEvent: TimelineEvent = {
      id: crypto.randomUUID(),
      type: 'CRM',
      message: entry.acao,
      actorId: entry.usuarioId,
      actorName: entry.usuarioNome,
      createdAt: now,
      action: entry.acao,
      previousStatus: entry.statusAnterior,
      nextStatus: entry.statusNovo,
    }
    TimelineService.append(entry.entityId, entry.entityId, timelineEvent)

    // 3. Histórico unificado local
    const item: CRMHistoricoItem = {
      id: auditLog.id,
      tipo: 'AUDITORIA',
      mensagem: `${entry.acao}: ${entry.statusAnterior ?? '—'} → ${entry.statusNovo ?? '—'}`,
      timestamp: now,
      usuarioNome: entry.usuarioNome,
      statusAnterior: entry.statusAnterior,
      statusNovo: entry.statusNovo,
    }
    saveHistory([item, ...readHistory()])
  },

  /**
   * Busca histórico unificado de uma entidade
   */
  getHistorico(entityId?: string): CRMHistoricoItem[] {
    const all = readHistory()
    return entityId
      ? all.filter((item) => item.mensagem.includes(entityId))
      : all
  },

  /**
   * Busca timeline de uma entidade específica
   */
  getTimeline(entityId: string): TimelineEvent[] {
    return TimelineService.list(entityId)
  },

  /**
   * Registra apenas na timeline (para automações internas)
   */
  appendTimeline(entityId: string, codigo: string, event: Omit<TimelineEvent, 'id' | 'createdAt'>): void {
    TimelineService.append(entityId, codigo, {
      ...event,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    })
  },

  /**
   * Estatísticas do histórico
   */
  getStats(): { total: number; hoje: number; semana: number } {
    const all = readHistory()
    const hoje = new Date().toDateString()
    const semanaAtras = new Date(Date.now() - 7 * 86_400_000)

    return {
      total: all.length,
      hoje: all.filter((item) => new Date(item.timestamp).toDateString() === hoje).length,
      semana: all.filter((item) => new Date(item.timestamp) >= semanaAtras).length,
    }
  },
}
