/**
 * Serviço central de gerenciamento de anexos no Firebase Storage
 */

import { ref, uploadBytes, getBytes, getDownloadURL } from 'firebase/storage'
import {
  collection,
  addDoc,
  updateDoc,
  doc as firestoreDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore'
import { firebaseStorage, firestoreDb, firebaseAuth } from '@/firebase/app'
import type {
  AttachmentMetadata,
  AttachmentUploadRequest,
  AttachmentType,
  ModuleContext,
} from './types'

const db = firestoreDb!
const appStorage = firebaseStorage!
const getCurrentUserId = () => firebaseAuth?.currentUser?.uid || null

const STORAGE_BUCKET = 'anexos'
const ATTACHMENTS_COLLECTION = 'attachments'
const HISTORY_COLLECTION = 'attachment_history'

const ALLOWED_TYPES: Record<AttachmentType, string> = {
  PDF: 'application/pdf',
  JPG: 'image/jpeg',
  PNG: 'image/png',
  HEIC: 'image/heic',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  DWG: 'application/vnd.autodesk.autocad.drawing',
  DXF: 'image/vnd.dxf',
  KMZ: 'application/vnd.google-earth.kmz',
  KML: 'application/vnd.google-earth.kml+xml',
  ZIP: 'application/zip',
  MP4: 'video/mp4',
}

const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB

export const AttachmentService = {
  /**
   * Upload de arquivo centralizado
   */
  async upload(request: AttachmentUploadRequest): Promise<AttachmentMetadata> {
    try {
      const userId = getCurrentUserId()
      if (!userId) throw new Error('Usuario nao autenticado')

      // Validar arquivo
      if (request.arquivo.size > MAX_FILE_SIZE) {
        throw new Error('Arquivo excede tamanho maximo de 500MB')
      }

      if (!ALLOWED_TYPES[request.tipo]) {
        throw new Error(`Tipo de arquivo ${request.tipo} nao permitido`)
      }

      // Gerar caminho no Storage
      const storagePath = `${STORAGE_BUCKET}/${request.clienteId}/${request.projetoId || 'SEM_PROJETO'}/${request.moduloContext}/${request.tipo}/${Date.now()}_${request.arquivo.name}`

      // Upload para Firebase Storage
      const fileRef = ref(appStorage, storagePath)
      await uploadBytes(fileRef, request.arquivo)
      const url = await getDownloadURL(fileRef)

      // Criar documento de metadados em Firestore
      const metadata: Omit<AttachmentMetadata, 'id'> = {
        nome: request.nome,
        tipo: request.tipo,
        categoria: request.categoria,
        tamanho: request.arquivo.size,
        mimeType: request.arquivo.type,
        url,
        firebaseStoragePath: storagePath,
        versao: 1,
        status: 'ATIVO',
        isFavorite: false,
        clienteId: request.clienteId,
        clienteNome: request.clienteNome,
        projetoId: request.projetoId,
        moduloContext: request.moduloContext,
        criadoEm: new Date().toISOString(),
        criadoPor: userId,
        atualizadoEm: new Date().toISOString(),
        atualizadoPor: userId,
        observacoes: request.observacoes,
        tags: request.tags || [],
        downloadCount: 0,
      }

      const doc = await addDoc(
        collection(db, ATTACHMENTS_COLLECTION),
        metadata
      )

      // Registrar no histórico
      await this.registrarHistorico(doc.id, 'UPLOAD', userId, `Upload do arquivo ${request.nome}`)

      return { ...metadata, id: doc.id }
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      throw error
    }
  },

  /**
   * Download de arquivo
   */
  async download(attachmentId: string, fileName: string): Promise<void> {
    try {
      const userId = getCurrentUserId()
      const doc = await this.obterPorId(attachmentId)

      if (!doc) throw new Error('Anexo nao encontrado')

      // Buscar URL do Storage
      const fileRef = ref(appStorage, doc.firebaseStoragePath)
      const bytes = await getBytes(fileRef)

      // Criar blob e disparar download
      const blob = new Blob([bytes], { type: doc.mimeType })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName || doc.nome
      link.click()
      URL.revokeObjectURL(url)

      // Atualizar contador e histórico
      if (userId) {
        await updateDoc(firestoreDoc(db, ATTACHMENTS_COLLECTION, attachmentId), {
          downloadCount: (doc.downloadCount || 0) + 1,
          atualizadoEm: Timestamp.now(),
        })
        await this.registrarHistorico(
          attachmentId,
          'DOWNLOAD',
          userId,
          `Download realizado por ${userId}`
        )
      }
    } catch (error) {
      console.error('Erro ao fazer download:', error)
      throw error
    }
  },

  /**
   * Obter metadados de anexo por ID
   */
  async obterPorId(id: string): Promise<AttachmentMetadata | null> {
    try {
      const docSnap = await getDocs(query(collection(db, ATTACHMENTS_COLLECTION), where('id', '==', id)))
      
      if (docSnap.empty) return null
      
      const data = docSnap.docs[0].data()
      return { id, ...data } as AttachmentMetadata
    } catch (error) {
      console.error('Erro ao obter anexo:', error)
      return null
    }
  },

  /**
   * Listar anexos por cliente
   */
  async listarPorCliente(clienteId: string): Promise<AttachmentMetadata[]> {
    try {
      const q = query(
        collection(db, ATTACHMENTS_COLLECTION),
        where('clienteId', '==', clienteId),
        where('status', '==', 'ATIVO')
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AttachmentMetadata))
    } catch (error) {
      console.error('Erro ao listar anexos:', error)
      return []
    }
  },

  /**
   * Listar anexos por módulo
   */
  async listarPorModulo(moduloContext: ModuleContext): Promise<AttachmentMetadata[]> {
    try {
      const q = query(
        collection(db, ATTACHMENTS_COLLECTION),
        where('moduloContext', '==', moduloContext),
        where('status', '==', 'ATIVO')
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AttachmentMetadata))
    } catch (error) {
      console.error('Erro ao listar anexos:', error)
      return []
    }
  },

  /**
   * Deletar anexo (soft delete)
   */
  async deletar(attachmentId: string): Promise<void> {
    try {
      const userId = getCurrentUserId()
      const docRef = firestoreDoc(db, ATTACHMENTS_COLLECTION, attachmentId)
      
      await updateDoc(docRef, {
        status: 'DELETADO',
        atualizadoEm: Timestamp.now(),
        atualizadoPor: userId,
      })

      if (userId) {
        await this.registrarHistorico(
          attachmentId,
          'EXCLUSAO',
          userId,
          `Arquivo deletado por ${userId}`
        )
      }
    } catch (error) {
      console.error('Erro ao deletar anexo:', error)
      throw error
    }
  },

  /**
   * Adicionar aos favoritos
   */
  async adicionarAosFavoritos(attachmentId: string): Promise<void> {
    try {
      const docRef = firestoreDoc(db, ATTACHMENTS_COLLECTION, attachmentId)
      await updateDoc(docRef, {
        isFavorite: true,
        atualizadoEm: Timestamp.now(),
      })
    } catch (error) {
      console.error('Erro ao adicionar aos favoritos:', error)
      throw error
    }
  },

  /**
   * Remover dos favoritos
   */
  async removerDosFavoritos(attachmentId: string): Promise<void> {
    try {
      const docRef = firestoreDoc(db, ATTACHMENTS_COLLECTION, attachmentId)
      await updateDoc(docRef, {
        isFavorite: false,
        atualizadoEm: Timestamp.now(),
      })
    } catch (error) {
      console.error('Erro ao remover dos favoritos:', error)
      throw error
    }
  },

  /**
   * Registrar ação no histórico
   */
  async registrarHistorico(
    attachmentId: string,
    acao: string,
    usuario: string,
    observacao?: string
  ): Promise<void> {
    try {
      const agora = new Date()
      const historico = {
        attachmentId,
        acao,
        usuario,
        data: agora.toISOString().split('T')[0],
        hora: agora.toISOString().split('T')[1],
        observacao,
        criadoEm: Timestamp.now(),
      }

      await addDoc(collection(db, HISTORY_COLLECTION), historico)
    } catch (error) {
      console.error('Erro ao registrar histórico:', error)
    }
  },

  /**
   * Obter histórico de um anexo
   */
  async obterHistorico(attachmentId: string): Promise<Record<string, unknown>[]> {
    try {
      const q = query(
        collection(db, HISTORY_COLLECTION),
        where('attachmentId', '==', attachmentId)
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (error) {
      console.error('Erro ao obter histórico:', error)
      return []
    }
  },

  /**
   * Atualizar metadados de um anexo
   */
  async atualizarMetadados(
    attachmentId: string,
    atualizacoes: Partial<AttachmentMetadata>
  ): Promise<void> {
    try {
      const userId = getCurrentUserId()
      const docRef = firestoreDoc(db, ATTACHMENTS_COLLECTION, attachmentId)
      
      await updateDoc(docRef, {
        ...atualizacoes,
        atualizadoEm: Timestamp.now(),
        atualizadoPor: userId,
      })

      if (userId) {
        await this.registrarHistorico(
          attachmentId,
          'ALTERACAO_CATEGORIA',
          userId,
          `Metadados atualizados por ${userId}`
        )
      }
    } catch (error) {
      console.error('Erro ao atualizar metadados:', error)
      throw error
    }
  },
}


