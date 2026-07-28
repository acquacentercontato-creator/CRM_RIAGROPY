import { doc, runTransaction } from 'firebase/firestore'
import { firestoreDb } from '@/firebase/app'
import { LoggerService } from '@/shared/services/LoggerService'
import type { WorkflowTypeCode } from '@/shared/workflow/WorkflowTypes'

const COUNTER_DOC_PATH = ['core_counters', 'global_workflow_sequence'] as const
const LOCAL_COUNTER_KEY = 'riagro.global.workflow.sequence'

const padSequence = (sequence: number) => String(sequence).padStart(4, '0')

const parseCode = (code: string) => {
  const match = /^(\d{2})([ACPGMRIT])(\d+)\.(\d+)$/.exec(code.trim().toUpperCase())
  if (!match) return null

  return {
    ano: match[1],
    tipo: match[2] as WorkflowTypeCode,
    sequencia: Number(match[3]),
    versao: Number(match[4]),
  }
}

const nextLocalSequence = () => {
  const raw = globalThis.localStorage?.getItem(LOCAL_COUNTER_KEY) ?? '0'
  const current = Number.parseInt(raw, 10)
  const next = Number.isFinite(current) ? current + 1 : 1
  globalThis.localStorage?.setItem(LOCAL_COUNTER_KEY, String(next))
  return next
}

const nextGlobalSequence = async (): Promise<number> => {
  if (!firestoreDb) {
    return nextLocalSequence()
  }

  const counterRef = doc(firestoreDb, COUNTER_DOC_PATH[0], COUNTER_DOC_PATH[1])

  try {
    const nextValue = await runTransaction(firestoreDb, async (tx) => {
      const snap = await tx.get(counterRef)
      const current = snap.exists() ? Number((snap.data().sequence as number | undefined) ?? 0) : 0
      const next = current + 1

      tx.set(
        counterRef,
        {
          sequence: next,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      )

      return next
    })

    return nextValue
  } catch (error) {
    LoggerService.warn('Falha ao usar contador global no Firestore, aplicando fallback local', error)
    return nextLocalSequence()
  }
}

export const RevisionService = {
  async generateOfficialCode(tipo: WorkflowTypeCode): Promise<string> {
    const sequence = await nextGlobalSequence()
    const year = String(new Date().getFullYear()).slice(-2)
    return `${year}${tipo}${padSequence(sequence)}.1`
  },

  nextRevision(currentCode: string): string {
    const parsed = parseCode(currentCode)
    if (!parsed) {
      throw new Error('Codigo oficial invalido para revisao')
    }

    const nextVersion = parsed.versao + 1
    return `${parsed.ano}${parsed.tipo}${padSequence(parsed.sequencia)}.${nextVersion}`
  },
}
