/**
 * Motor de cálculos hidráulicos — Darcy-Weisbach + Hazen-Williams
 */

import type {
  HydraulicSystemParams,
  HydraulicCalculationResult,
  PumpData,
  PumpSelectionResult,
} from '../types/hydraulicTypes'
import { PUMP_CATALOG } from '../data/componentLibrary'

// ── Constantes ─────────────────────────────────────────────────────────────

const G = 9.81          // m/s²
const RHO = 1000        // kg/m³ (água a 20°C)
const NU = 1e-6         // m²/s (viscosidade cinemática água 20°C)

// Coeficientes Hazen-Williams por material
const HW_COEFFICIENTS: Record<string, number> = {
  PVC: 150,
  PEAD: 150,
  FERRO_GALVANIZADO: 120,
  FERRO_FUNDIDO: 100,
  ACO: 120,
}

// Potências comerciais normalizadas (kW)
const POTENCIAS_COMERCIAIS = [0.37, 0.55, 0.75, 1.1, 1.5, 2.2, 3, 4, 5.5, 7.5, 11, 15, 18.5, 22, 30, 37, 45, 55, 75]

const proximaPotenciaComercial = (p: number): number => {
  const pc = POTENCIAS_COMERCIAIS.find((v) => v >= p * 1.15)
  return pc ?? p * 1.3
}

// ── Core calculations ──────────────────────────────────────────────────────

export const HydraulicCalculations = {
  /**
   * Velocidade de escoamento em tubulação circular
   * v = Q / A  onde A = π*D²/4
   */
  velocidade(vazao_m3h: number, dn_mm: number): number {
    const Q = vazao_m3h / 3600  // m³/s
    const D = dn_mm / 1000       // m
    const A = Math.PI * D * D / 4
    return Q / A                 // m/s
  },

  /**
   * Número de Reynolds
   */
  reynolds(v: number, dn_mm: number): number {
    const D = dn_mm / 1000
    return (v * D) / NU
  },

  /**
   * Regime de escoamento
   */
  regimeEscoamento(re: number): 'LAMINAR' | 'TRANSICAO' | 'TURBULENTO' {
    if (re < 2000) return 'LAMINAR'
    if (re < 4000) return 'TRANSICAO'
    return 'TURBULENTO'
  },

  /**
   * Fator de atrito (Blasius para turbulento suave)
   */
  fatorFriccao(re: number): number {
    if (re < 2000) return 64 / re
    if (re < 100000) return 0.316 * Math.pow(re, -0.25)
    return 0.0032 + 0.221 * Math.pow(re, -0.237)
  },

  /**
   * Perda de carga unitária por Hazen-Williams (m/100m)
   * J = 10.67 × Q^1.852 / (C^1.852 × D^4.87)
   */
  perdaCargaHW(vazao_m3h: number, dn_mm: number, C: number): number {
    const Q = vazao_m3h / 3600  // m³/s
    const D = dn_mm / 1000       // m
    const J = 10.67 * Math.pow(Q, 1.852) / (Math.pow(C, 1.852) * Math.pow(D, 4.87))
    return J * 100               // m/100m
  },

  /**
   * Perda de carga distribuída pelo comprimento (m)
   */
  perdaCargaDistribuida(J: number, comprimento: number): number {
    return J * comprimento / 100
  },

  /**
   * Altura manométrica total (m.c.a.)
   * Hm = Hgeom + Hf_total + Hv
   */
  alturaManometrica(alturaGeom: number, perdaCargaTotal: number, v: number): number {
    const Hv = v * v / (2 * G)  // perda de carga de velocidade (desprezível mas incluso)
    return alturaGeom + perdaCargaTotal + Hv
  },

  /**
   * Potência hidráulica (kW)
   * P = ρ × g × Q × Hm / 1000
   */
  potenciaHidraulica(vazao_m3h: number, Hm: number): number {
    const Q = vazao_m3h / 3600
    return (RHO * G * Q * Hm) / 1000
  },

  /**
   * Potência absorvida considerando eficiência da bomba (kW)
   */
  potenciaAbsorvida(Ph: number, eta: number): number {
    return Ph / eta
  },

  /**
   * Cálculo completo do sistema
   */
  calcular(params: HydraulicSystemParams): HydraulicCalculationResult {
    const advertencias: string[] = []

    const C = params.coeficienteHW ?? HW_COEFFICIENTS[params.materialTubulacao] ?? 130
    const eta = params.eficienciaBomba ?? 0.70
    const reserva = params.reservaTecnica ?? 15

    // Velocidade
    const v = this.velocidade(params.vazao, params.diametroTubulacao)

    // Verificações de velocidade
    if (v > 3.0) advertencias.push('hydraulic.adv.velocidadeAlta')
    if (v < 0.5) advertencias.push('hydraulic.adv.velocidadeBaixa')

    // Reynolds e regime
    const Re = this.reynolds(v, params.diametroTubulacao)
    const regime = this.regimeEscoamento(Re)
    const f = this.fatorFriccao(Re)

    // Perda de carga
    const J = this.perdaCargaHW(params.vazao, params.diametroTubulacao, C)
    const hfDistribuida = this.perdaCargaDistribuida(J, params.comprimentoTubulacao)
    const hfAcessorios = params.perdaCargaAcessorios ?? hfDistribuida * 0.15
    const hfTotal = hfDistribuida + hfAcessorios
    const hfReserva = hfTotal * (reserva / 100)
    const hfSistema = hfTotal + hfReserva

    // Altura manométrica
    const Hm = this.alturaManometrica(params.alturaGeometrica, hfSistema, v)

    // Potências
    const Ph = this.potenciaHidraulica(params.vazao, Hm)
    const Pa = this.potenciaAbsorvida(Ph, eta)
    const Pm = proximaPotenciaComercial(Pa)

    if (Hm > 100) advertencias.push('hydraulic.adv.alturaElevada')
    if (Pa / Pm > 0.9) advertencias.push('hydraulic.adv.motorProximoLimite')

    return {
      velocidade: Math.round(v * 100) / 100,
      numeroReynolds: Math.round(Re),
      regimeEscoamento: regime,
      fatorFriccao: Math.round(f * 10000) / 10000,
      perdaCargaUnitaria: Math.round(J * 100) / 100,
      perdaCargaTotal: Math.round(hfTotal * 100) / 100,
      perdaCargaAcessorios: Math.round(hfAcessorios * 100) / 100,
      perdaCargaReserva: Math.round(hfReserva * 100) / 100,
      perdaCargaSistema: Math.round(hfSistema * 100) / 100,
      alturaManometricaTotal: Math.round(Hm * 100) / 100,
      potenciaHidraulica: Math.round(Ph * 100) / 100,
      potenciaAbsorvida: Math.round(Pa * 100) / 100,
      potenciaMotor: Pm,
      vazao: params.vazao,
      coeficienteHW: C,
      advertencias,
    }
  },
}

// ── Pump selection assistant ───────────────────────────────────────────────

export const PumpAssistant = {
  /**
   * Interpolação linear na curva da bomba para uma dada vazão
   */
  interpolateCurve(pump: PumpData, vazao: number): { altura: number; rendimento: number; potencia: number; npsh: number } | null {
    const curva = pump.curva
    if (!curva || curva.length < 2) return null

    for (let i = 0; i < curva.length - 1; i++) {
      const p1 = curva[i]
      const p2 = curva[i + 1]
      if (vazao >= p1.vazao && vazao <= p2.vazao) {
        const t = (vazao - p1.vazao) / (p2.vazao - p1.vazao)
        return {
          altura: p1.altura + t * (p2.altura - p1.altura),
          rendimento: p1.rendimento + t * (p2.rendimento - p1.rendimento),
          potencia: p1.potencia + t * (p2.potencia - p1.potencia),
          npsh: p1.npsh + t * (p2.npsh - p1.npsh),
        }
      }
    }
    return null
  },

  /**
   * Seleciona as melhores bombas para um sistema (Q, Hm)
   */
  select(vazao: number, alturaManometrica: number, topN = 3): PumpSelectionResult[] {
    const results: PumpSelectionResult[] = []

    for (const pump of PUMP_CATALOG) {
      const ponto = this.interpolateCurve(pump, vazao)
      if (!ponto) continue

      // A bomba precisa fornecer pelo menos a Hm necessária no ponto de operação
      if (ponto.altura < alturaManometrica * 0.9) continue

      // Score baseado: proximidade do ponto de máximo rendimento + adequação
      const margem = ((ponto.altura - alturaManometrica) / alturaManometrica) * 100
      if (margem < 0 || margem > 30) continue

      const score = Math.max(0, 100 - Math.abs(margem - 10) * 3 - Math.abs(ponto.rendimento - 75) * 0.5)

      const advertencias: string[] = []
      if (margem < 5) advertencias.push('hydraulic.adv.pumpMargemBaixa')
      if (ponto.rendimento < 60) advertencias.push('hydraulic.adv.pumpRendimentoBaixo')

      results.push({
        bomba: pump,
        pontoOperacao: {
          vazao,
          altura: Math.round(ponto.altura * 100) / 100,
          rendimento: Math.round(ponto.rendimento * 100) / 100,
          potencia: Math.round(ponto.potencia * 100) / 100,
          npsh: Math.round(ponto.npsh * 100) / 100,
        },
        margem: Math.round(margem * 10) / 10,
        motorIndicado: pump.motorRecomendado ?? 'Consultar fabricante',
        tubulacaoRecomendada: pump.tubulacaoRecomendada ?? `PVC PN10 DN${pump.dn}`,
        advertencias,
        score: Math.round(score),
      })
    }

    return results.sort((a, b) => b.score - a.score).slice(0, topN)
  },

  /**
   * Velocidade específica — ns = n × √Q / Hm^(3/4)
   */
  velocidadeEspecifica(n: number, Q: number, Hm: number): number {
    return n * Math.sqrt(Q / 3600) / Math.pow(Hm, 0.75)
  },

  /**
   * Tipo de bomba pela velocidade específica
   */
  tipoPorNs(ns: number): string {
    if (ns < 50) return 'hydraulic.pump.radial'
    if (ns < 150) return 'hydraulic.pump.mista'
    return 'hydraulic.pump.axial'
  },
}
