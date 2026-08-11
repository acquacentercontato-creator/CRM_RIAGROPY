/**
 * Serviço de pesquisa global de anexos
 */

import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from 'firebase/firestore'
import { firestoreDb } from '@/firebase/app'
import type { AttachmentMetadata, AttachmentSearchFilter } from './types'

const db = firestoreDb!

const ATTACHMENTS_COLLECTION = 'attachments'

export const SearchService = {
  /**
   * Pesquisa avançada de anexos
   */
  async pesquisar(filtros: AttachmentSearchFilter): Promise<{
    resultados: AttachmentMetadata[]
    total: number
    temProxima: boolean
  }> {
    try {
      // Construir filtros
      const condicoes: Array<ReturnType<typeof where>> = [where('status', '==', 'ATIVO')]

      if (filtros.clienteId) {
        condicoes.push(where('clienteId', '==', filtros.clienteId))
      }

      if (filtros.moduloContext && filtros.moduloContext.length > 0) {
        condicoes.push(where('moduloContext', 'in', filtros.moduloContext))
      }

      if (filtros.tipo && filtros.tipo.length > 0) {
        condicoes.push(where('tipo', 'in', filtros.tipo))
      }

      if (filtros.categoria && filtros.categoria.length > 0) {
        condicoes.push(where('categoria', 'in', filtros.categoria))
      }

      if (filtros.criadoPor) {
        condicoes.push(where('criadoPor', '==', filtros.criadoPor))
      }

      if (filtros.isFavorite !== undefined) {
        condicoes.push(where('isFavorite', '==', filtros.isFavorite))
      }

      // Aplicar ordenação
      const ordenacao = filtros.ordenarPor || 'data'
      const direcao = filtros.ordem === 'ASC' ? 'asc' : 'desc'

      const q = query(
        collection(db, ATTACHMENTS_COLLECTION),
        ...(condicoes as ReturnType<typeof where>[]),
        orderBy(
          ordenacao === 'nome' ? 'nome' :
          ordenacao === 'tamanho' ? 'tamanho' :
          ordenacao === 'downloads' ? 'downloadCount' :
          'criadoEm',
          direcao
        ),
        limit((filtros.limite || 20) + 1) // +1 para verificar se há mais
      )

      const querySnapshot = await getDocs(q)
      const limite = filtros.limite || 20
      const resultados = querySnapshot.docs
        .slice(0, limite)
        .map((doc) => ({ id: doc.id, ...doc.data() } as AttachmentMetadata))

      // Filtrar por query de texto (pesquisa em nome e tags)
      let resultadosFiltrados = resultados
      if (filtros.query) {
        const queryLower = filtros.query.toLowerCase()
        resultadosFiltrados = resultados.filter(
          (anexo) =>
            anexo.nome.toLowerCase().includes(queryLower) ||
            anexo.tags?.some((tag) => tag.toLowerCase().includes(queryLower)) ||
            anexo.observacoes?.toLowerCase().includes(queryLower)
        )
      }

      // Filtrar por data se especificado
      if (filtros.dataInicio || filtros.dataFim) {
        resultadosFiltrados = resultadosFiltrados.filter((anexo) => {
          const data = new Date(anexo.criadoEm)
          if (filtros.dataInicio && data < new Date(filtros.dataInicio)) return false
          if (filtros.dataFim && data > new Date(filtros.dataFim)) return false
          return true
        })
      }

      return {
        resultados: resultadosFiltrados,
        total: resultadosFiltrados.length,
        temProxima: querySnapshot.docs.length > limite,
      }
    } catch (error) {
      console.error('Erro ao pesquisar anexos:', error)
      return { resultados: [], total: 0, temProxima: false }
    }
  },

  /**
   * Pesquisa rápida por nome/tags
   */
  async pesquisarRapido(query: string, limite: number = 10): Promise<AttachmentMetadata[]> {
    try {
      const q = query_firestore(
        collection(db, ATTACHMENTS_COLLECTION),
        where('status', '==', 'ATIVO'),
        orderBy('downloadCount', 'desc'),
        limit(limite * 2) // Buscar mais para filtrar
      )

      const querySnapshot = await getDocs(q)
      const queryLower = query.toLowerCase()

      const resultados = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as AttachmentMetadata))
        .filter(
          (anexo) =>
            anexo.nome.toLowerCase().includes(queryLower) ||
            anexo.tags?.some((tag) => tag.toLowerCase().includes(queryLower))
        )
        .slice(0, limite)

      return resultados
    } catch (error) {
      console.error('Erro ao fazer pesquisa rápida:', error)
      return []
    }
  },

  /**
   * Obter arquivos recentes (últimos X dias)
   */
  async obterRecentes(dias: number = 7): Promise<AttachmentMetadata[]> {
    try {
      const dataLimite = new Date()
      dataLimite.setDate(dataLimite.getDate() - dias)

      const q = query(
        collection(db, ATTACHMENTS_COLLECTION),
        where('status', '==', 'ATIVO'),
        orderBy('criadoEm', 'desc'),
        limit(50)
      )

      const querySnapshot = await getDocs(q)

      const resultados = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as AttachmentMetadata))
        .filter((anexo) => new Date(anexo.criadoEm) >= dataLimite)
        .slice(0, 20)

      return resultados
    } catch (error) {
      console.error('Erro ao obter arquivos recentes:', error)
      return []
    }
  },

  /**
   * Obter favoritos do usuário
   */
  async obterFavoritos(): Promise<AttachmentMetadata[]> {
    try {
      const q = query(
        collection(db, ATTACHMENTS_COLLECTION),
        where('status', '==', 'ATIVO'),
        where('isFavorite', '==', true),
        orderBy('criadoEm', 'desc')
      )

      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AttachmentMetadata))
    } catch (error) {
      console.error('Erro ao obter favoritos:', error)
      return []
    }
  },

  /**
   * Obter estatísticas de busca
   */
  async obterEstatisticas(): Promise<{
    totalAnexos: number
    porTipo: Record<string, number>
    porCategoria: Record<string, number>
    porModulo: Record<string, number>
  }> {
    try {
      const q = query(
        collection(db, ATTACHMENTS_COLLECTION),
        where('status', '==', 'ATIVO')
      )

      const querySnapshot = await getDocs(q)
      const anexos = querySnapshot.docs.map((doc) => doc.data() as AttachmentMetadata)

      const porTipo: Record<string, number> = {}
      const porCategoria: Record<string, number> = {}
      const porModulo: Record<string, number> = {}

      anexos.forEach((anexo) => {
        porTipo[anexo.tipo] = (porTipo[anexo.tipo] || 0) + 1
        porCategoria[anexo.categoria] = (porCategoria[anexo.categoria] || 0) + 1
        porModulo[anexo.moduloContext] = (porModulo[anexo.moduloContext] || 0) + 1
      })

      return {
        totalAnexos: anexos.length,
        porTipo,
        porCategoria,
        porModulo,
      }
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error)
      return {
        totalAnexos: 0,
        porTipo: {},
        porCategoria: {},
        porModulo: {},
      }
    }
  },

  /**
   * Autocomplete para tags
   */
  async obterTagsSugeridas(prefixo: string, limite: number = 10): Promise<string[]> {
    try {
      const q = query(
        collection(db, ATTACHMENTS_COLLECTION),
        where('status', '==', 'ATIVO'),
        limit(500)
      )

      const querySnapshot = await getDocs(q)
      const todas_tags = new Set<string>()

      querySnapshot.docs.forEach((doc) => {
        const anexo = doc.data() as AttachmentMetadata
        anexo.tags?.forEach((tag) => {
          if (tag.toLowerCase().startsWith(prefixo.toLowerCase())) {
            todas_tags.add(tag)
          }
        })
      })

      return Array.from(todas_tags).slice(0, limite)
    } catch (error) {
      console.error('Erro ao obter tags sugeridas:', error)
      return []
    }
  },
}

// Alias para compatibilidade
const query_firestore = query

