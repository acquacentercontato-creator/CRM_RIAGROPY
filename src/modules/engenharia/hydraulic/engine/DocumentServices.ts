/**
 * Geração inteligente de Memorial Descritivo e Lista de Materiais a partir dos cálculos hidráulicos
 */

import type { HydraulicCalculationResult, HydraulicSystemParams, PumpData } from '../types/hydraulicTypes'
import { HYDRAULIC_CATALOG } from '../data/componentLibrary'
import type { HydraulicComponent } from '../types/hydraulicTypes'
import { TranslationService } from '@/shared/services/TranslationService'

// ── Types ──────────────────────────────────────────────────────────────────

export interface MemorialInput {
  nomeProjeto: string
  nomeCliente: string
  nomeResponsavel: string
  crea: string
  municipio: string
  estado: string
  areaIrrigada: number      // ha
  culturaIrrigada: string
  sistemaIrrigacao: string  // 'ASPERSAO' | 'GOTEJAMENTO' | 'PIVO' | 'CARRETEL'
  fonteDagua: string
  params: HydraulicSystemParams
  resultado: HydraulicCalculationResult
  bomba?: PumpData
  dataElaboracao?: string
}

export interface MaterialItem {
  id: string
  codigo: string
  descricao: string
  unidade: string
  quantidade: number
  precoUnitario: number
  total: number
  categoria: string
  fabricante?: string
  observacao?: string
}

export interface MaterialList {
  itens: MaterialItem[]
  subtotal: number
  reservaTecnica: number
  total: number
  dataGeracao: string
}

export interface MemorialDescritivo {
  titulo: string
  data: string
  responsavel: string
  crea: string
  secoes: MemorialSection[]
  rodape: string
}

export interface MemorialSection {
  titulo: string
  conteudo: string
}

// ── Memorial Generator ─────────────────────────────────────────────────────

export const MemorialService = {
  /**
   * Gera memorial descritivo completo a partir dos dados do projeto
   */
  gerar(input: MemorialInput): MemorialDescritivo {
    const { params, resultado, bomba } = input
    const data = input.dataElaboracao ?? new Date().toLocaleDateString(TranslationService.t('crm.currency.locale'))

    const material = this._nomeMaterial(params.materialTubulacao)

    const secoes: MemorialSection[] = [
      {
        titulo: '1. IDENTIFICAÇÃO DO PROJETO',
        conteudo: [
          `Projeto: ${input.nomeProjeto}`,
          `Proprietário / Cliente: ${input.nomeCliente}`,
          `Município: ${input.municipio} — ${input.estado}`,
          `Cultura irrigada: ${input.culturaIrrigada}`,
          `Área irrigada: ${input.areaIrrigada.toFixed(2)} ha`,
          `Sistema de irrigação: ${input.sistemaIrrigacao}`,
          `Fonte d'água: ${input.fonteDagua}`,
          `Data de elaboração: ${data}`,
          `Responsável técnico: ${input.nomeResponsavel}`,
          `CREA: ${input.crea}`,
        ].join('\n'),
      },
      {
        titulo: '2. OBJETIVO',
        conteudo: `O presente memorial descritivo tem por finalidade descrever o sistema de irrigação por ${input.sistemaIrrigacao.toLowerCase()} a ser implantado na propriedade de ${input.nomeCliente}, localizada no município de ${input.municipio}/${input.estado}, com área irrigada de ${input.areaIrrigada.toFixed(2)} hectares destinados ao cultivo de ${input.culturaIrrigada.toLowerCase()}.

O projeto foi desenvolvido de acordo com as normas técnicas vigentes (ABNT NBR 10844, NBR 7198) e os princípios de uso eficiente da água, garantindo uniformidade de distribuição e eficiência energética.`,
      },
      {
        titulo: '3. PARÂMETROS DE PROJETO',
        conteudo: [
          `Vazão de projeto: ${params.vazao.toFixed(2)} m³/h`,
          `Altura geométrica: ${params.alturaGeometrica.toFixed(2)} m`,
          `Material da tubulação principal: ${material}`,
          `Diâmetro nominal (DN): ${params.diametroTubulacao} mm`,
          `Comprimento da tubulação principal: ${params.comprimentoTubulacao.toFixed(0)} m`,
          `Reserva técnica adotada: ${params.reservaTecnica ?? 15}%`,
          bomba ? `Bomba selecionada: ${bomba.modelo} — ${bomba.fabricante}` : '',
        ].filter(Boolean).join('\n'),
      },
      {
        titulo: '4. CÁLCULO HIDRÁULICO',
        conteudo: [
          `4.1 Velocidade de escoamento`,
          `   Velocidade calculada: ${resultado.velocidade.toFixed(2)} m/s (recomendada: 0,5 a 3,0 m/s)`,
          `   Número de Reynolds: ${resultado.numeroReynolds.toLocaleString()} — Regime: ${this._regimeTexto(resultado.regimeEscoamento)}`,
          `   Coeficiente Hazen-Williams (C): ${resultado.coeficienteHW}`,
          '',
          `4.2 Perdas de carga`,
          `   Perda de carga unitária: ${resultado.perdaCargaUnitaria.toFixed(3)} m/100m`,
          `   Perda de carga distribuída: ${(resultado.perdaCargaTotal - resultado.perdaCargaAcessorios).toFixed(2)} m`,
          `   Perdas em conexões e acessórios (15%): ${resultado.perdaCargaAcessorios.toFixed(2)} m`,
          `   Reserva técnica (${params.reservaTecnica ?? 15}%): ${resultado.perdaCargaReserva.toFixed(2)} m`,
          `   Perda de carga total do sistema: ${resultado.perdaCargaSistema.toFixed(2)} m`,
          '',
          `4.3 Dimensionamento da unidade de bombeamento`,
          `   Altura manométrica total: ${resultado.alturaManometricaTotal.toFixed(2)} m.c.a.`,
          `   Potência hidráulica: ${resultado.potenciaHidraulica.toFixed(2)} kW`,
          `   Potência absorvida (η = ${((params.eficienciaBomba ?? 0.70) * 100).toFixed(0)}%): ${resultado.potenciaAbsorvida.toFixed(2)} kW`,
          `   Potência do motor recomendada: ${resultado.potenciaMotor.toFixed(2)} kW (valor comercial normalizado)`,
        ].join('\n'),
      },
      {
        titulo: '5. SISTEMA DE BOMBEAMENTO',
        conteudo: bomba
          ? [
              `Equipamento selecionado: ${bomba.modelo}`,
              `Fabricante: ${bomba.fabricante} — Linha: ${bomba.linha}`,
              `Velocidade nominal: ${bomba.velocidade} RPM`,
              `Potência nominal: ${bomba.potenciaNominal} kW`,
              `Rendimento nominal: ${bomba.rendimentoNominal}%`,
              `NPSH requerido: ${bomba.npshRequerido} m`,
              `Frequência: ${bomba.frequencia} Hz — Tensão: ${bomba.tensao} — ${bomba.fases} fases`,
              `Motor indicado: ${bomba.motorRecomendado ?? 'Conforme potência calculada'}`,
              `Tubulação de recalque recomendada: ${bomba.tubulacaoRecomendada ?? `${material} DN${params.diametroTubulacao}`}`,
            ].join('\n')
          : `Sistema de bombeamento a ser selecionado conforme ponto de operação:\n   Vazão: ${params.vazao} m³/h | AMT: ${resultado.alturaManometricaTotal.toFixed(2)} m.c.a. | Motor: ${resultado.potenciaMotor} kW`,
      },
      {
        titulo: '6. OPERAÇÃO E MANUTENÇÃO',
        conteudo: `6.1 Operação
   — Verificar nível d'água na fonte antes de cada acionamento
   — Operar a bomba dentro da faixa de vazão especificada (±10%)
   — Monitorar pressão manométrica no manômetro de recalque
   — Registrar horário de funcionamento diário

6.2 Manutenção preventiva
   — Verificar alinhamento e fixação do conjunto moto-bomba (semanal)
   — Inspecionar vedações e gaxetas (mensal)
   — Revisar filtros e strainers (mensal ou conforme turbidez da água)
   — Revisar conjunto elétrico: conexões, proteções, inversor (trimestral)
   — Manutenção geral do conjunto moto-bomba (anual ou a cada 2.000h)`,
      },
      {
        titulo: '7. CONCLUSÃO',
        conteudo: `O sistema de irrigação projetado atende plenamente às necessidades hídricas da cultura de ${input.culturaIrrigada.toLowerCase()} na área de ${input.areaIrrigada.toFixed(2)} ha, com eficiência energética e uniformidade de distribuição adequadas.

Todos os dimensionamentos foram realizados dentro dos limites técnicos normativos, com reserva técnica de ${params.reservaTecnica ?? 15}% sobre as perdas de carga. O projeto poderá ser executado conforme especificações desta memória descritiva e das demais plantas e documentos técnicos integrantes do projeto.

${input.municipio}/${input.estado}, ${data}

_______________________________
${input.nomeResponsavel}
CREA ${input.crea}
Responsável Técnico`,
      },
    ]

    return {
      titulo: `MEMORIAL DESCRITIVO — SISTEMA DE IRRIGAÇÃO\n${input.nomeProjeto}`,
      data,
      responsavel: input.nomeResponsavel,
      crea: input.crea,
      secoes,
      rodape: `Documento gerado pelo CRM RIAGRO V3 | ${data} | ${input.nomeResponsavel} — CREA ${input.crea}`,
    }
  },

  _regimeTexto(regime: string): string {
    const map: Record<string, string> = {
      LAMINAR: 'Laminar',
      TRANSICAO: 'Transição',
      TURBULENTO: 'Turbulento (completamente rugoso)',
    }
    return map[regime] ?? regime
  },

  _nomeMaterial(material: string): string {
    const map: Record<string, string> = {
      PVC: 'PVC rígido',
      PEAD: 'Polietileno de alta densidade (PEAD)',
      FERRO_GALVANIZADO: 'Ferro galvanizado',
      FERRO_FUNDIDO: 'Ferro fundido',
      ACO: 'Aço',
    }
    return map[material] ?? material
  },
}

// ── Material List Generator ────────────────────────────────────────────────

export const MaterialListService = {
  /**
   * Gera lista de materiais com base nos parâmetros do sistema
   */
  gerar(input: MemorialInput): MaterialList {
    const { params, bomba } = input
    const itens: MaterialItem[] = []

    // Tubulação principal
    const tubCatalog = HYDRAULIC_CATALOG.filter(
      (c) => c.tipo === 'TUBULACAO' &&
        (c.dn ?? 0) >= params.diametroTubulacao - 10 &&
        (c.dn ?? 0) <= params.diametroTubulacao + 10
    )[0] as HydraulicComponent | undefined

    const comprimentoBarras = Math.ceil(params.comprimentoTubulacao / 6) // barras de 6m
    const precoTub = tubCatalog?.preco ?? params.diametroTubulacao * 1.5

    itens.push({
      id: 'TUB-01',
      codigo: tubCatalog?.codigo ?? `PVC-${params.diametroTubulacao}`,
      descricao: tubCatalog?.modelo ?? `Tubo PVC PN10 DN${params.diametroTubulacao} × 6m`,
      unidade: 'barra',
      quantidade: comprimentoBarras,
      precoUnitario: precoTub,
      total: comprimentoBarras * precoTub,
      categoria: 'TUBULAÇÃO',
      fabricante: tubCatalog?.fabricante ?? 'TIGRE',
    })

    // Conexões (estimativa: 1 joelho a cada 25m + 1 união a cada 50m)
    const qtdJoelhos = Math.ceil(params.comprimentoTubulacao / 25)
    const qtdUnioes = Math.ceil(params.comprimentoTubulacao / 50)

    itens.push({
      id: 'CON-01',
      codigo: `JOELHO-${params.diametroTubulacao}`,
      descricao: `Joelho 90° PVC DN${params.diametroTubulacao}`,
      unidade: 'pç',
      quantidade: qtdJoelhos,
      precoUnitario: params.diametroTubulacao * 0.3,
      total: qtdJoelhos * params.diametroTubulacao * 0.3,
      categoria: 'CONEXÃO',
      fabricante: 'TIGRE',
    })

    itens.push({
      id: 'CON-02',
      codigo: `UNIAO-${params.diametroTubulacao}`,
      descricao: `União PVC DN${params.diametroTubulacao}`,
      unidade: 'pç',
      quantidade: qtdUnioes,
      precoUnitario: params.diametroTubulacao * 0.25,
      total: qtdUnioes * params.diametroTubulacao * 0.25,
      categoria: 'CONEXÃO',
      fabricante: 'TIGRE',
    })

    // Válvula de gaveta
    const valCatalog = HYDRAULIC_CATALOG.find((c) => c.tipo === 'VALVULA' && c.fabricante === 'TIGRE')
    itens.push({
      id: 'VAL-01',
      codigo: valCatalog?.codigo ?? `VCM-${params.diametroTubulacao}`,
      descricao: `Válvula de gaveta DN${params.diametroTubulacao}`,
      unidade: 'pç',
      quantidade: 2,
      precoUnitario: valCatalog?.preco ?? params.diametroTubulacao * 2.2,
      total: 2 * (valCatalog?.preco ?? params.diametroTubulacao * 2.2),
      categoria: 'VÁLVULA',
      fabricante: 'TIGRE',
    })

    // Filtro
    const filtroCatalog = HYDRAULIC_CATALOG.find((c) => c.tipo === 'FILTRO')
    itens.push({
      id: 'FIL-01',
      codigo: filtroCatalog?.codigo ?? 'FILTRO-TELA',
      descricao: filtroCatalog?.descricao ?? `Filtro de tela 3" 100mesh`,
      unidade: 'pç',
      quantidade: 1,
      precoUnitario: filtroCatalog?.preco ?? 380,
      total: filtroCatalog?.preco ?? 380,
      categoria: 'FILTRO',
      fabricante: filtroCatalog?.fabricante ?? 'IMOTO',
    })

    // Conjunto moto-bomba
    if (bomba) {
      itens.push({
        id: 'BOM-01',
        codigo: bomba.codigo,
        descricao: `${bomba.modelo} — ${bomba.descricao}`,
        unidade: 'cj',
        quantidade: 1,
        precoUnitario: bomba.preco ?? 5000,
        total: bomba.preco ?? 5000,
        categoria: 'BOMBA',
        fabricante: bomba.fabricante,
      })
    } else {
      const potKw = input.resultado.potenciaMotor
      itens.push({
        id: 'BOM-01',
        codigo: `BOMBA-${potKw}KW`,
        descricao: `Conjunto moto-bomba centrífuga ${potKw}kW — conforme projeto`,
        unidade: 'cj',
        quantidade: 1,
        precoUnitario: potKw * 800,
        total: potKw * 800,
        categoria: 'BOMBA',
      })
    }

    // Quadro elétrico de proteção (estimativa)
    itens.push({
      id: 'ELE-01',
      codigo: 'QCP-01',
      descricao: `Quadro elétrico de proteção ${input.resultado.potenciaMotor}kW com disjuntor, contator e relé térmico`,
      unidade: 'cj',
      quantidade: 1,
      precoUnitario: input.resultado.potenciaMotor * 150,
      total: input.resultado.potenciaMotor * 150,
      categoria: 'ELÉTRICO',
    })

    // Manômetro
    itens.push({
      id: 'INS-01',
      codigo: 'MAN-100',
      descricao: 'Manômetro 100mm 0-10kgf/cm² com glicerina',
      unidade: 'pç',
      quantidade: 2,
      precoUnitario: 85,
      total: 170,
      categoria: 'INSTRUMENTAÇÃO',
    })

    // Mão de obra (estimativa 15% do material)
    const subtotalMaterial = itens.reduce((sum, i) => sum + i.total, 0)
    itens.push({
      id: 'MDO-01',
      codigo: 'MDO-INST',
      descricao: 'Instalação e montagem — mão de obra especializada',
      unidade: 'serv',
      quantidade: 1,
      precoUnitario: subtotalMaterial * 0.15,
      total: subtotalMaterial * 0.15,
      categoria: 'MÃO DE OBRA',
      observacao: '15% sobre o custo de materiais',
    })

    const subtotal = itens.reduce((sum, i) => sum + i.total, 0)
    const reserva = subtotal * 0.05

    return {
      itens,
      subtotal,
      reservaTecnica: reserva,
      total: subtotal + reserva,
      dataGeracao: new Date().toLocaleDateString(TranslationService.t('crm.currency.locale')),
    }
  },
}

// ── Print Utilities ────────────────────────────────────────────────────────

export const PrintService = {
  /**
   * Imprime HTML como PDF via janela de impressão do browser
   */
  imprimirHtml(html: string, titulo: string): void {
    const locale = TranslationService.t('crm.currency.locale')
    const janela = window.open('', '_blank')
    if (!janela) return

    janela.document.write(`
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <title>${titulo}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 11pt; line-height: 1.6; color: #222; padding: 20mm 20mm 20mm 25mm; }
    h1 { font-size: 14pt; text-align: center; margin-bottom: 8mm; border-bottom: 2px solid #1a5276; padding-bottom: 4mm; }
    h2 { font-size: 12pt; color: #1a5276; margin-top: 6mm; margin-bottom: 3mm; border-left: 3px solid #1a5276; padding-left: 4mm; }
    p, pre { font-size: 10pt; white-space: pre-wrap; margin-bottom: 3mm; }
    table { width: 100%; border-collapse: collapse; margin: 4mm 0; font-size: 9pt; }
    th { background: #1a5276; color: white; padding: 3mm 2mm; text-align: left; }
    td { padding: 2mm; border-bottom: 0.5pt solid #ccc; }
    tr:nth-child(even) td { background: #f5f8fa; }
    .total-row td { font-weight: bold; border-top: 1.5pt solid #1a5276; background: #eaf0f7 !important; }
    .footer { position: fixed; bottom: 10mm; left: 20mm; right: 20mm; font-size: 8pt; color: #666; border-top: 0.5pt solid #ccc; padding-top: 2mm; text-align: center; }
    .cover { text-align: center; padding-top: 60mm; }
    .cover .empresa { font-size: 18pt; font-weight: bold; color: #1a5276; margin-bottom: 6mm; }
    .cover .doc-tipo { font-size: 13pt; color: #555; margin-bottom: 4mm; }
    .cover .projeto { font-size: 12pt; font-weight: bold; margin-bottom: 8mm; }
    .cover .info { font-size: 10pt; color: #555; }
    @media print {
      .no-print { display: none !important; }
      h2 { page-break-after: avoid; }
      table { page-break-inside: auto; }
    }
  </style>
</head>
<body>
${html}
<script>window.onload = () => { window.print(); }</script>
</body>
</html>`)

    janela.document.close()
  },

  /**
   * Converte memorial para HTML
   */
  memorialToHtml(memorial: MemorialDescritivo): string {
    const t = TranslationService.t
    const secoes = memorial.secoes
      .map((s) => `<h2>${s.titulo}</h2><pre>${s.conteudo}</pre>`)
      .join('\n')

    return `
<h1>${memorial.titulo}</h1>
<p style="text-align:right;font-size:9pt;color:#666">${t('doc.print.date')}: ${memorial.data} | CREA: ${memorial.crea}</p>
${secoes}
<div class="footer">${memorial.rodape}</div>`
  },

  /**
   * Converte lista de materiais para HTML
   */
  materialListToHtml(lista: MaterialList, nomeProjeto: string, nomeCliente: string): string {
    const t = TranslationService.t
    const locale = t('crm.currency.locale')
    const linhas = lista.itens
      .map(
        (item) => `<tr>
  <td>${item.codigo}</td>
  <td>${item.descricao}</td>
  <td>${item.fabricante ?? '—'}</td>
  <td style="text-align:center">${item.quantidade}</td>
  <td style="text-align:center">${item.unidade}</td>
  <td style="text-align:right">R$ ${item.precoUnitario.toLocaleString(locale, { minimumFractionDigits: 2 })}</td>
  <td style="text-align:right">R$ ${item.total.toLocaleString(locale, { minimumFractionDigits: 2 })}</td>
</tr>`
      )
      .join('\n')

    return `
<h1>${t('doc.materiais.titulo')}</h1>
<p><strong>${t('doc.print.project')}:</strong> ${nomeProjeto} | <strong>${t('doc.print.client')}:</strong> ${nomeCliente} | <strong>${t('doc.print.date')}:</strong> ${lista.dataGeracao}</p>
<table>
  <thead><tr><th>${t('doc.print.code')}</th><th>${t('doc.print.description')}</th><th>${t('doc.print.manufacturer')}</th><th>${t('doc.print.quantity')}</th><th>${t('doc.print.unit')}</th><th>${t('doc.print.unitPrice')}</th><th>${t('doc.print.total')}</th></tr></thead>
  <tbody>
    ${linhas}
  </tbody>
  <tfoot>
    <tr class="total-row"><td colspan="6">${t('doc.materiais.subtotal')}</td><td style="text-align:right">R$ ${lista.subtotal.toLocaleString(locale, { minimumFractionDigits: 2 })}</td></tr>
    <tr class="total-row"><td colspan="6">${t('doc.materiais.reserve')}</td><td style="text-align:right">R$ ${lista.reservaTecnica.toLocaleString(locale, { minimumFractionDigits: 2 })}</td></tr>
    <tr class="total-row"><td colspan="6"><strong>${t('doc.materiais.total')}</strong></td><td style="text-align:right"><strong>R$ ${lista.total.toLocaleString(locale, { minimumFractionDigits: 2 })}</strong></td></tr>
  </tfoot>
</table>`
  },
}
