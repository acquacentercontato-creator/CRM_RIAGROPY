/**
 * Serviço de Assistência Técnica — CRUD com AutomationService integrado
 */

import { AutomationService } from '@/shared/crm-automation'
import type { AssistenciaChamado, AssistenciaStatus, AssistenciaPrioridade } from '../types/assistenciaTypes'
import { SLA_POR_PRIORIDADE } from '../types/assistenciaTypes'

const STORAGE_KEY = 'riagro.assistencia.chamados.v1'

const readLocal = (): AssistenciaChamado[] => {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AssistenciaChamado[]) : []
  } catch { return [] }
}

const saveLocal = (list: AssistenciaChamado[]) => {
  globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 1000)))
}

const nowIso = () => new Date().toISOString()
const nextCodigo = (list: AssistenciaChamado[]) =>
  `ASS-${String(list.length + 1).padStart(4, '0')}`

export const AssistenciaService = {
  list(): AssistenciaChamado[] {
    return readLocal()
  },

  getById(id: string): AssistenciaChamado | null {
    return readLocal().find((c) => c.id === id) ?? null
  },

  create(input: Omit<AssistenciaChamado, 'id' | 'codigo' | 'status' | 'checklist' | 'historico' | 'createdAt' | 'updatedAt'>): AssistenciaChamado {
    const list = readLocal()
    const now = nowIso()
    const slaHoras = SLA_POR_PRIORIDADE[input.prioridade as AssistenciaPrioridade] ?? 24

    const chamado: AssistenciaChamado = {
      id: crypto.randomUUID(),
      codigo: nextCodigo(list),
      ...input,
      status: 'CHAMADO',
      slaHoras,
      checklist: [],
      historico: [
        {
          id: crypto.randomUUID(),
          status: 'CHAMADO',
          descricao: 'technical.ass.history.opened',
          responsavel: input.responsavel ?? 'technical.ass.system',
          timestamp: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    }

    saveLocal([chamado, ...list])

    AutomationService.notifyStatusChanged({
      entityId: chamado.id,
      entityType: 'ASSISTENCIA',
      statusAnterior: '',
      statusNovo: 'CHAMADO',
      clienteNome: chamado.clienteNome,
      codigoInterno: chamado.codigo,
      timestamp: now,
    })

    return chamado
  },

  updateStatus(id: string, novoStatus: AssistenciaStatus, responsavel: string, descricao?: string): AssistenciaChamado | null {
    const list = readLocal()
    const idx = list.findIndex((c) => c.id === id)
    if (idx < 0) return null

    const found = list[idx]
    const now = nowIso()
    const statusAnterior = found.status

    const updated: AssistenciaChamado = {
      ...found,
      status: novoStatus,
      updatedAt: now,
      historico: [
        ...found.historico,
        {
          id: crypto.randomUUID(),
          status: novoStatus,
          descricao: descricao ?? 'technical.ass.history.statusChanged',
          responsavel,
          timestamp: now,
        },
      ],
    }

    if (novoStatus === 'AGENDAMENTO' && !updated.dataAgendamento) {
      updated.dataAgendamento = now
    }
    if (novoStatus === 'TECNICO_CAMPO' && !updated.dataAtendimento) {
      updated.dataAtendimento = now
    }
    if (novoStatus === 'FINALIZADO' || novoStatus === 'GARANTIA') {
      updated.dataFechamento = now
    }

    list[idx] = updated
    saveLocal(list)

    AutomationService.notifyStatusChanged({
      entityId: updated.id,
      entityType: 'ASSISTENCIA',
      statusAnterior,
      statusNovo: novoStatus,
      clienteNome: updated.clienteNome,
      codigoInterno: updated.codigo,
      timestamp: now,
    })

    return updated
  },

  updateChecklist(id: string, checklistItemId: string, done: boolean): void {
    const list = readLocal()
    const idx = list.findIndex((c) => c.id === id)
    if (idx < 0) return

    list[idx].checklist = list[idx].checklist.map((item) =>
      item.id === checklistItemId ? { ...item, done } : item
    )
    list[idx].updatedAt = nowIso()
    saveLocal(list)
  },

  addChecklistItems(id: string, items: Array<{ id: string; label: string; obrigatorio: boolean }>): void {
    const list = readLocal()
    const idx = list.findIndex((c) => c.id === id)
    if (idx < 0) return

    const existingIds = new Set(list[idx].checklist.map((i) => i.id))
    const newItems = items
      .filter((item) => !existingIds.has(item.id))
      .map((item) => ({ ...item, done: false }))

    list[idx].checklist = [...list[idx].checklist, ...newItems]
    list[idx].updatedAt = nowIso()
    saveLocal(list)
  },

  delete(id: string): void {
    saveLocal(readLocal().filter((c) => c.id !== id))
  },

  getMetrics() {
    const all = readLocal()
    const abertas = all.filter((c) => !['FINALIZADO', 'CANCELADO'].includes(c.status))
    const agora = Date.now()
    const emSla = abertas.filter((c) => {
      const limite = new Date(c.createdAt).getTime() + c.slaHoras * 3_600_000
      return limite > agora
    })
    const garantias = all.filter((c) => c.status === 'GARANTIA')
    const finalizadas = all.filter((c) => c.status === 'FINALIZADO')

    const tempoMedioMs = finalizadas.length > 0
      ? finalizadas.reduce((sum, c) => {
          if (!c.dataFechamento) return sum
          return sum + (new Date(c.dataFechamento).getTime() - new Date(c.createdAt).getTime())
        }, 0) / finalizadas.length
      : 0

    return {
      abertas: abertas.length,
      emSla: emSla.length,
      slaVencidos: abertas.length - emSla.length,
      garantias: garantias.length,
      finalizadas: finalizadas.length,
      tempoMedioDias: Math.round(tempoMedioMs / 86_400_000),
    }
  },
}
