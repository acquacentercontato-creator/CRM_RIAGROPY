/**
 * Serviços de Suprimentos: Estoque, Cotação e Pedido
 */

import { NotificationService } from '@/shared/services/NotificationService'
import { AutomationService } from '@/shared/crm-automation'
import type { MaterialItem } from '../engine/DocumentServices'

// ── Types ──────────────────────────────────────────────────────────────────

export type EstoqueStatusItem = 'DISPONIVEL' | 'RESERVADO' | 'INDISPONIVEL' | 'PARCIAL'

export interface EstoqueItem {
  id: string
  codigo: string
  descricao: string
  unidade: string
  quantidadeEstoque: number
  quantidadeReservada: number
  quantidadeDisponivel: number
  precoMedio: number
  localizacao?: string
  fornecedorPrincipal?: string
  updatedAt: string
}

export interface ReservaItem {
  materialItemId: string
  codigo: string
  descricao: string
  unidade: string
  quantidadeSolicitada: number
  quantidadeAtendida: number
  quantidadePendente: number
  statusItem: EstoqueStatusItem
}

export interface ReservaEstoque {
  id: string
  numero: string
  projetoId: string
  nomeProjeto: string
  nomeCliente: string
  obraId?: string
  status: 'RASCUNHO' | 'RESERVADA' | 'PARCIAL' | 'LIBERADA' | 'CANCELADA'
  itens: ReservaItem[]
  observacoes?: string
  criadoEm: string
  criadoPor: string
  liberadaEm?: string
}

export interface FornecedorItem {
  fornecedor: string
  cnpj?: string
  contato?: string
  prazoEntrega: number  // dias
  precoUnitario: number
  condicoesPagamento?: string
  observacao?: string
}

export interface CotacaoItem {
  materialItemId: string
  codigo: string
  descricao: string
  unidade: string
  quantidade: number
  fornecedores: FornecedorItem[]
  fornecedorSelecionado?: string
  melhorPreco?: number
}

export interface Cotacao {
  id: string
  numero: string
  reservaId: string
  projetoId: string
  nomeProjeto: string
  nomeCliente: string
  status: 'ABERTA' | 'RESPONDIDA' | 'APROVADA' | 'CANCELADA'
  itens: CotacaoItem[]
  totalEstimado: number
  totalAprovado?: number
  validadeHoras: number
  criadoEm: string
  aprovadaEm?: string
  aprovadaPor?: string
  observacoes?: string
}

export interface PedidoItem {
  codigo: string
  descricao: string
  unidade: string
  quantidade: number
  precoUnitario: number
  total: number
  fornecedor: string
  prazoEntrega: number
  status: 'PENDENTE' | 'RECEBIDO' | 'PARCIAL'
}

export interface Pedido {
  id: string
  numero: string
  cotacaoId: string
  reservaId: string
  projetoId: string
  nomeProjeto: string
  nomeCliente: string
  obraId?: string
  status: 'RASCUNHO' | 'ENVIADO' | 'CONFIRMADO' | 'PARCIAL' | 'CONCLUIDO' | 'CANCELADO'
  itens: PedidoItem[]
  totalGeral: number
  condicoesPagamento: string
  prazoEntregaGeral: number
  enderecoEntrega?: string
  criadoEm: string
  enviadoEm?: string
  confirmadoEm?: string
  observacoes?: string
}

// ── Storage helpers ────────────────────────────────────────────────────────

const read = <T>(key: string): T[] => {
  try { return JSON.parse(globalThis.localStorage?.getItem(key) ?? '[]') as T[] }
  catch { return [] }
}

const write = <T>(key: string, data: T[]) =>
  globalThis.localStorage?.setItem(key, JSON.stringify(data))

const KEYS = {
  estoque: 'riagro.suprimentos.estoque',
  reservas: 'riagro.suprimentos.reservas',
  cotacoes: 'riagro.suprimentos.cotacoes',
  pedidos: 'riagro.suprimentos.pedidos',
}

const nowIso = () => new Date().toISOString()

// Gerador de numeração sequencial
const nextNumero = (prefix: string, lista: Array<{ numero: string }>) => {
  const max = lista.reduce((n, item) => {
    const num = parseInt(item.numero.replace(prefix + '-', ''), 10)
    return isNaN(num) ? n : Math.max(n, num)
  }, 0)
  return `${prefix}-${String(max + 1).padStart(5, '0')}`
}

// ── EstoqueService ─────────────────────────────────────────────────────────

export const EstoqueService = {
  listar(): EstoqueItem[] { return read<EstoqueItem>(KEYS.estoque) },

  /** Verifica disponibilidade de uma lista de materiais */
  verificarDisponibilidade(itens: MaterialItem[]): ReservaItem[] {
    const estoque = this.listar()
    return itens.map((item) => {
      const estoqueItem = estoque.find((e) => e.codigo === item.codigo)
      const disponivel = estoqueItem?.quantidadeDisponivel ?? 0
      const atendida = Math.min(disponivel, item.quantidade)
      const pendente = Math.max(0, item.quantidade - atendida)
      const statusItem: EstoqueStatusItem =
        pendente === 0 ? 'DISPONIVEL' :
        atendida > 0 ? 'PARCIAL' : 'INDISPONIVEL'

      return {
        materialItemId: item.id,
        codigo: item.codigo,
        descricao: item.descricao,
        unidade: item.unidade,
        quantidadeSolicitada: item.quantidade,
        quantidadeAtendida: atendida,
        quantidadePendente: pendente,
        statusItem,
      }
    })
  },

  /** Atualiza ou cria item no estoque */
  upsertItem(item: Omit<EstoqueItem, 'id' | 'updatedAt'>): EstoqueItem {
    const lista = this.listar()
    const existente = lista.findIndex((e) => e.codigo === item.codigo)
    const novo: EstoqueItem = {
      id: crypto.randomUUID(),
      ...item,
      quantidadeDisponivel: item.quantidadeEstoque - item.quantidadeReservada,
      updatedAt: nowIso(),
    }
    if (existente >= 0) {
      lista[existente] = { ...lista[existente], ...novo, id: lista[existente].id }
    } else {
      lista.push(novo)
    }
    write(KEYS.estoque, lista)
    return lista[existente >= 0 ? existente : lista.length - 1]
  },
}

// ── ReservaService ─────────────────────────────────────────────────────────

export const ReservaService = {
  listar(): ReservaEstoque[] { return read<ReservaEstoque>(KEYS.reservas) },

  listarPorProjeto(projetoId: string): ReservaEstoque[] {
    return this.listar().filter((r) => r.projetoId === projetoId)
  },

  criar(params: {
    projetoId: string
    nomeProjeto: string
    nomeCliente: string
    itens: MaterialItem[]
    criadoPor: string
    observacoes?: string
  }): ReservaEstoque {
    const lista = this.listar()
    const itensReserva = EstoqueService.verificarDisponibilidade(params.itens)
    const temPendente = itensReserva.some((i) => i.quantidadePendente > 0)
    const todosAtendidos = itensReserva.every((i) => i.statusItem === 'DISPONIVEL')

    const reserva: ReservaEstoque = {
      id: crypto.randomUUID(),
      numero: nextNumero('RSV', lista),
      projetoId: params.projetoId,
      nomeProjeto: params.nomeProjeto,
      nomeCliente: params.nomeCliente,
      status: todosAtendidos ? 'RESERVADA' : temPendente ? 'PARCIAL' : 'RASCUNHO',
      itens: itensReserva,
      observacoes: params.observacoes,
      criadoEm: nowIso(),
      criadoPor: params.criadoPor,
    }

    write(KEYS.reservas, [reserva, ...lista])

    NotificationService.create('info', `Reserva ${reserva.numero}`,
      `${params.nomeProjeto}: ${itensReserva.filter((i) => i.statusItem === 'DISPONIVEL').length}/${itensReserva.length} itens disponíveis`,
      { projetoId: params.projetoId })

    return reserva
  },

  atualizar(id: string, updates: Partial<ReservaEstoque>): ReservaEstoque | null {
    const lista = this.listar()
    const idx = lista.findIndex((r) => r.id === id)
    if (idx < 0) return null
    lista[idx] = { ...lista[idx], ...updates }
    write(KEYS.reservas, lista)
    return lista[idx]
  },
}

// ── CotacaoService ─────────────────────────────────────────────────────────

export const CotacaoService = {
  listar(): Cotacao[] { return read<Cotacao>(KEYS.cotacoes) },

  criar(params: {
    reserva: ReservaEstoque
    validadeHoras?: number
    observacoes?: string
  }): Cotacao {
    const lista = this.listar()
    const itensPendentes = params.reserva.itens.filter((i) => i.quantidadePendente > 0)

    const cotacao: Cotacao = {
      id: crypto.randomUUID(),
      numero: nextNumero('COT', lista),
      reservaId: params.reserva.id,
      projetoId: params.reserva.projetoId,
      nomeProjeto: params.reserva.nomeProjeto,
      nomeCliente: params.reserva.nomeCliente,
      status: 'ABERTA',
      validadeHoras: params.validadeHoras ?? 72,
      itens: itensPendentes.map((item) => ({
        materialItemId: item.materialItemId,
        codigo: item.codigo,
        descricao: item.descricao,
        unidade: item.unidade,
        quantidade: item.quantidadePendente,
        fornecedores: [],
      })),
      totalEstimado: 0,
      criadoEm: nowIso(),
      observacoes: params.observacoes,
    }

    write(KEYS.cotacoes, [cotacao, ...lista])

    NotificationService.create('info', `Cotação ${cotacao.numero} aberta`,
      `${params.reserva.nomeProjeto}: ${itensPendentes.length} item(s) para cotar`,
      { projetoId: params.reserva.projetoId })

    return cotacao
  },

  adicionarFornecedor(cotacaoId: string, itemIdx: number, fornecedor: FornecedorItem): Cotacao | null {
    const lista = this.listar()
    const idx = lista.findIndex((c) => c.id === cotacaoId)
    if (idx < 0) return null
    lista[idx].itens[itemIdx].fornecedores.push(fornecedor)
    // Recalcula total estimado com melhor preço
    lista[idx].totalEstimado = lista[idx].itens.reduce((sum, item) => {
      const melhor = item.fornecedores.reduce<number | null>(
        (min, f) => (min === null || f.precoUnitario < min ? f.precoUnitario : min), null
      )
      return sum + (melhor ?? 0) * item.quantidade
    }, 0)
    write(KEYS.cotacoes, lista)
    return lista[idx]
  },

  selecionarFornecedor(cotacaoId: string, itemIdx: number, nomeFornecedor: string): Cotacao | null {
    const lista = this.listar()
    const idx = lista.findIndex((c) => c.id === cotacaoId)
    if (idx < 0) return null
    lista[idx].itens[itemIdx].fornecedorSelecionado = nomeFornecedor
    const f = lista[idx].itens[itemIdx].fornecedores.find((x) => x.fornecedor === nomeFornecedor)
    lista[idx].itens[itemIdx].melhorPreco = f?.precoUnitario
    write(KEYS.cotacoes, lista)
    return lista[idx]
  },

  aprovar(cotacaoId: string, aprovadaPor: string): Cotacao | null {
    const lista = this.listar()
    const idx = lista.findIndex((c) => c.id === cotacaoId)
    if (idx < 0) return null
    lista[idx].status = 'APROVADA'
    lista[idx].aprovadaEm = nowIso()
    lista[idx].aprovadaPor = aprovadaPor
    lista[idx].totalAprovado = lista[idx].itens.reduce(
      (sum, item) => sum + (item.melhorPreco ?? 0) * item.quantidade, 0
    )
    write(KEYS.cotacoes, lista)
    NotificationService.create('success', `Cotação ${lista[idx].numero} aprovada`,
      `Total: R$ ${lista[idx].totalAprovado?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
    return lista[idx]
  },
}

// ── PedidoService ──────────────────────────────────────────────────────────

export const PedidoService = {
  listar(): Pedido[] { return read<Pedido>(KEYS.pedidos) },

  criarDeCotacao(cotacao: Cotacao, params: {
    condicoesPagamento: string
    enderecoEntrega?: string
    observacoes?: string
    obraId?: string
  }): Pedido {
    const lista = this.listar()
    const itens: PedidoItem[] = cotacao.itens.map((item) => {
      const fornSel = item.fornecedores.find((f) => f.fornecedor === item.fornecedorSelecionado)
        ?? item.fornecedores[0]
      return {
        codigo: item.codigo,
        descricao: item.descricao,
        unidade: item.unidade,
        quantidade: item.quantidade,
        precoUnitario: item.melhorPreco ?? fornSel?.precoUnitario ?? 0,
        total: (item.melhorPreco ?? fornSel?.precoUnitario ?? 0) * item.quantidade,
        fornecedor: item.fornecedorSelecionado ?? fornSel?.fornecedor ?? '—',
        prazoEntrega: fornSel?.prazoEntrega ?? 7,
        status: 'PENDENTE',
      }
    })

    const prazoMax = itens.reduce((max, i) => Math.max(max, i.prazoEntrega), 0)

    const pedido: Pedido = {
      id: crypto.randomUUID(),
      numero: nextNumero('PED', lista),
      cotacaoId: cotacao.id,
      reservaId: cotacao.reservaId,
      projetoId: cotacao.projetoId,
      nomeProjeto: cotacao.nomeProjeto,
      nomeCliente: cotacao.nomeCliente,
      obraId: params.obraId,
      status: 'RASCUNHO',
      itens,
      totalGeral: itens.reduce((s, i) => s + i.total, 0),
      condicoesPagamento: params.condicoesPagamento,
      prazoEntregaGeral: prazoMax,
      enderecoEntrega: params.enderecoEntrega,
      criadoEm: nowIso(),
      observacoes: params.observacoes,
    }

    write(KEYS.pedidos, [pedido, ...lista])

    NotificationService.create('info', `Pedido ${pedido.numero} gerado`,
      `${cotacao.nomeProjeto} | R$ ${pedido.totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | Prazo: ${prazoMax}d`)

    return pedido
  },

  enviar(id: string): Pedido | null {
    const lista = this.listar()
    const idx = lista.findIndex((p) => p.id === id)
    if (idx < 0) return null
    lista[idx].status = 'ENVIADO'
    lista[idx].enviadoEm = nowIso()
    write(KEYS.pedidos, lista)
    const pedido = lista[idx]

    // Notificar motor de automação — inicia obra
    AutomationService.notifyStatusChanged({
      entityId: pedido.projetoId,
      entityType: 'OBRA',
      statusAnterior: 'LIBERACAO FINANCEIRA',
      statusNovo: 'PLANEJAMENTO',
      clienteNome: pedido.nomeCliente,
      codigoInterno: pedido.numero,
      timestamp: nowIso(),
    })

    NotificationService.create('success', `Pedido ${pedido.numero} enviado`,
      `Materiais confirmados — obra pode ser iniciada.`)

    return pedido
  },

  confirmar(id: string): Pedido | null {
    const lista = this.listar()
    const idx = lista.findIndex((p) => p.id === id)
    if (idx < 0) return null
    lista[idx].status = 'CONFIRMADO'
    lista[idx].confirmadoEm = nowIso()
    write(KEYS.pedidos, lista)
    return lista[idx]
  },

  getMetrics() {
    const pedidos = this.listar()
    const reservas = ReservaService.listar()
    const cotacoes = CotacaoService.listar()
    return {
      totalPedidos: pedidos.length,
      pedidosPendentes: pedidos.filter((p) => p.status === 'ENVIADO' || p.status === 'RASCUNHO').length,
      pedidosConfirmados: pedidos.filter((p) => p.status === 'CONFIRMADO' || p.status === 'CONCLUIDO').length,
      totalReservas: reservas.length,
      reservasPendentes: reservas.filter((r) => r.status === 'PARCIAL' || r.status === 'RASCUNHO').length,
      cotacoesAbertas: cotacoes.filter((c) => c.status === 'ABERTA').length,
      valorTotalPedidos: pedidos.reduce((sum, p) => sum + p.totalGeral, 0),
    }
  },

  /** Imprime PDF do pedido via PrintService */
  imprimirPDF(pedido: Pedido): void {
    const html = `
<h1>PEDIDO DE COMPRA — ${pedido.numero}</h1>
<p><strong>Projeto:</strong> ${pedido.nomeProjeto} | <strong>Cliente:</strong> ${pedido.nomeCliente}<br/>
<strong>Data:</strong> ${new Date(pedido.criadoEm).toLocaleDateString('pt-BR')} | <strong>Prazo máx. entrega:</strong> ${pedido.prazoEntregaGeral} dias</p>
${pedido.enderecoEntrega ? `<p><strong>Endereço de entrega:</strong> ${pedido.enderecoEntrega}</p>` : ''}
<table>
  <thead><tr><th>Código</th><th>Descrição</th><th>Forn.</th><th>Qtd</th><th>Un</th><th>Pr. Unit.</th><th>Total</th><th>Prazo</th></tr></thead>
  <tbody>
    ${pedido.itens.map((item) => `<tr>
      <td>${item.codigo}</td><td>${item.descricao}</td><td>${item.fornecedor}</td>
      <td style="text-align:center">${item.quantidade}</td><td style="text-align:center">${item.unidade}</td>
      <td style="text-align:right">R$ ${item.precoUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
      <td style="text-align:right">R$ ${item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
      <td style="text-align:center">${item.prazoEntrega}d</td>
    </tr>`).join('')}
  </tbody>
  <tfoot>
    <tr class="total-row"><td colspan="6"><strong>TOTAL GERAL</strong></td>
    <td style="text-align:right"><strong>R$ ${pedido.totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></td><td></td></tr>
  </tfoot>
</table>
<p><strong>Condições de pagamento:</strong> ${pedido.condicoesPagamento}</p>
${pedido.observacoes ? `<p><strong>Observações:</strong> ${pedido.observacoes}</p>` : ''}
<p style="margin-top:15mm;text-align:center">
  ____________________________________<br/>Solicitante | ${new Date().toLocaleDateString('pt-BR')}
</p>`

    // Reuse PrintService from DocumentServices
    const janela = window.open('', '_blank')
    if (!janela) return
    janela.document.write(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Pedido ${pedido.numero}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;font-size:11pt;line-height:1.6;padding:20mm 20mm 20mm 25mm}
h1{font-size:14pt;text-align:center;margin-bottom:8mm;border-bottom:2px solid #1a5276;padding-bottom:4mm}
h2{font-size:12pt;color:#1a5276;margin-top:6mm;margin-bottom:3mm}p{margin-bottom:3mm}
table{width:100%;border-collapse:collapse;margin:4mm 0;font-size:9pt}
th{background:#1a5276;color:white;padding:3mm 2mm;text-align:left}td{padding:2mm;border-bottom:0.5pt solid #ccc}
tr:nth-child(even) td{background:#f5f8fa}.total-row td{font-weight:bold;border-top:1.5pt solid #1a5276;background:#eaf0f7!important}
@media print{.no-print{display:none!important}}</style></head><body>${html}
<script>window.onload=()=>{window.print()}</script></body></html>`)
    janela.document.close()
  },
}
