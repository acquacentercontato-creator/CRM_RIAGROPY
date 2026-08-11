/**
 * Serviço de versionamento de anexos
 */

import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore'
import { firestoreDb, firebaseAuth } from '@/firebase/app'
import type { AttachmentVersion } from './types'

const db = firestoreDb!
const getCurrentUserId = () => firebaseAuth?.currentUser?.uid || null

const VERSIONS_COLLECTION = 'attachment_versions'
const ATTACHMENTS_COLLECTION = 'attachments'

export const VersioningService = {
  /**
   * Criar nova versão de um anexo
   */
  async criarVersao(
    attachmentId: string,
    url: string,
    firebaseStoragePath: string,
    tamanho: number,
    mudancas?: string
  ): Promise<AttachmentVersion> {
    try {
      const userId = getCurrentUserId()

      // Obter número da próxima versão
      const ultimaVersao = await this.obterUltimaVersao(attachmentId)
      const proximaVersao = (ultimaVersao?.versao || 0) + 1

      const novaVersao: Omit<AttachmentVersion, 'id'> = {
        attachmentId,
        versao: proximaVersao,
        url,
        firebaseStoragePath,
        tamanho,
        criadoEm: new Date().toISOString(),
        criadoPor: userId || 'SISTEMA',
        mudancas,
      }

      const docRef = await addDoc(collection(db, VERSIONS_COLLECTION), novaVersao)

      // Atualizar versão do attachment principal
      const attachmentRef = doc(db, ATTACHMENTS_COLLECTION, attachmentId)
      await updateDoc(attachmentRef, {
        versao: proximaVersao,
        atualizadoEm: Timestamp.now(),
        atualizadoPor: userId,
      })

      return { ...novaVersao, id: docRef.id }
    } catch (error) {
      console.error('Erro ao criar versão:', error)
      throw error
    }
  },

  /**
   * Obter todas as versões de um anexo
   */
  async obterVersoes(attachmentId: string): Promise<AttachmentVersion[]> {
    try {
      const q = query(
        collection(db, VERSIONS_COLLECTION),
        where('attachmentId', '==', attachmentId),
        orderBy('versao', 'desc')
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as AttachmentVersion))
    } catch (error) {
      console.error('Erro ao obter versões:', error)
      return []
    }
  },

  /**
   * Obter versão específica
   */
  async obterVersao(attachmentId: string, numeroVersao: number): Promise<AttachmentVersion | null> {
    try {
      const q = query(
        collection(db, VERSIONS_COLLECTION),
        where('attachmentId', '==', attachmentId),
        where('versao', '==', numeroVersao)
      )
      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) return null
      
      const doc = querySnapshot.docs[0]
      return { id: doc.id, ...doc.data() } as AttachmentVersion
    } catch (error) {
      console.error('Erro ao obter versão:', error)
      return null
    }
  },

  /**
   * Obter última versão de um anexo
   */
  async obterUltimaVersao(attachmentId: string): Promise<AttachmentVersion | null> {
    try {
      const versoes = await this.obterVersoes(attachmentId)
      return versoes.length > 0 ? versoes[0] : null
    } catch (error) {
      console.error('Erro ao obter última versão:', error)
      return null
    }
  },

  /**
   * Restaurar versão anterior
   */
  async restaurarVersao(
    attachmentId: string,
    numeroVersao: number
  ): Promise<AttachmentVersion | null> {
    try {
      const versaoAnterior = await this.obterVersao(attachmentId, numeroVersao)

      if (!versaoAnterior) {
        throw new Error('Versao nao encontrada')
      }

      // Criar nova versão a partir da anterior
      const novaVersao = await this.criarVersao(
        attachmentId,
        versaoAnterior.url,
        versaoAnterior.firebaseStoragePath,
        versaoAnterior.tamanho,
        `Restaurada a partir da versao ${numeroVersao}`
      )

      return novaVersao
    } catch (error) {
      console.error('Erro ao restaurar versão:', error)
      throw error
    }
  },

  /**
   * Comparar duas versões
   */
  async compararVersoes(
    attachmentId: string,
    versao1: number,
    versao2: number
  ): Promise<{ v1: AttachmentVersion | null; v2: AttachmentVersion | null; diferencas: string[] }> {
    try {
      const v1 = await this.obterVersao(attachmentId, versao1)
      const v2 = await this.obterVersao(attachmentId, versao2)

      const diferencas: string[] = []

      if (v1 && v2) {
        if (v1.tamanho !== v2.tamanho) {
          diferencas.push(`Tamanho diferente: ${v1.tamanho} vs ${v2.tamanho}`)
        }
        if (v1.criadoEm !== v2.criadoEm) {
          diferencas.push(`Data diferente: ${v1.criadoEm} vs ${v2.criadoEm}`)
        }
        if (v1.criadoPor !== v2.criadoPor) {
          diferencas.push(`Criador diferente: ${v1.criadoPor} vs ${v2.criadoPor}`)
        }
      }

      return { v1, v2, diferencas }
    } catch (error) {
      console.error('Erro ao comparar versões:', error)
      return { v1: null, v2: null, diferencas: ['Erro ao comparar'] }
    }
  },

  /**
   * Limpar versões antigas (manter apenas N mais recentes)
   */
  async limparVersõesAntigas(attachmentId: string, manter: number = 5): Promise<void> {
    try {
      const versoes = await this.obterVersoes(attachmentId)

      if (versoes.length > manter) {
        const versõesParaDeletar = versoes.slice(manter)

        for (const versao of versõesParaDeletar) {
          // Implementar soft delete ou hard delete conforme política
          console.log(`Marcando versão ${versao.versao} para limpeza`)
        }
      }
    } catch (error) {
      console.error('Erro ao limpar versões antigas:', error)
    }
  },

  /**
   * Obter estatísticas de versões
   */
  async obterEstatisticas(attachmentId: string): Promise<{
    totalVersoes: number
    tamanhoTotal: number
    primeiraVersao: string
    ultimaVersao: string
  }> {
    try {
      const versoes = await this.obterVersoes(attachmentId)

      return {
        totalVersoes: versoes.length,
        tamanhoTotal: versoes.reduce((sum, v) => sum + v.tamanho, 0),
        primeiraVersao: versoes[versoes.length - 1]?.criadoEm || '',
        ultimaVersao: versoes[0]?.criadoEm || '',
      }
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error)
      return { totalVersoes: 0, tamanhoTotal: 0, primeiraVersao: '', ultimaVersao: '' }
    }
  },
}
