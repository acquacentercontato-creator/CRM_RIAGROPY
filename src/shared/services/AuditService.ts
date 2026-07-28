import { addDoc, collection } from 'firebase/firestore'
import { firestoreDb } from '@/firebase/app'
import type { AuditLog } from '@/shared/types/core'
import { LoggerService } from '@/shared/services/LoggerService'

const AUDIT_COLLECTION = 'audit_logs'

export const AuditService = {
  async record(entry: AuditLog) {
    try {
      if (!firestoreDb) {
        LoggerService.warn('Audit fallback: firestore indisponivel', entry)
        return
      }
      await addDoc(collection(firestoreDb, AUDIT_COLLECTION), entry)
    } catch (error) {
      LoggerService.error('Falha ao registrar auditoria', error)
    }
  },
}
