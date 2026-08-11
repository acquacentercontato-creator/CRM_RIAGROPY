/**
 * Tipos do módulo de Engenharia Hidráulica
 */

// ── Component types ────────────────────────────────────────────────────────

export type HydraulicComponentType =
  | 'BOMBA'
  | 'TUBULACAO'
  | 'CONEXAO'
  | 'ASPERSOR'
  | 'CANHAO'
  | 'CARRETEL'
  | 'PIVO'
  | 'FILTRO'
  | 'VALVULA'
  | 'MOTOR'
  | 'SOFT_STARTER'
  | 'INVERSOR'

export type HydraulicManufacturer =
  | 'TIGRE'
  | 'EBARA'
  | 'IMOTO'
  | 'KIFCO'
  | 'NELSON'
  | 'RAINBIRD'
  | 'SENNINGER'
  | 'WEG'
  | 'SCHNEIDER'
  | 'GENERICO'

export interface HydraulicComponent {
  id: string
  codigo: string
  tipo: HydraulicComponentType
  fabricante: HydraulicManufacturer
  linha: string
  modelo: string
  descricao: string
  dn?: number            // Diâmetro nominal (mm)
  pn?: number            // Pressão nominal (kPa ou bar)
  vazaoNominal?: number  // m³/h
  pressaoNominal?: number // m.c.a.
  perdaCarga?: number    // m.c.a. / 100m
  peso?: number          // kg
  preco?: number         // R$
  urlImagem?: string
  urlCatalogo?: string
  especificacoes?: Record<string, string | number>
}

// ── Pump specific ──────────────────────────────────────────────────────────

export interface PumpCurvePoint {
  vazao: number          // m³/h
  altura: number         // m.c.a.
  rendimento: number     // %
  potencia: number       // kW
  npsh: number           // m
}

export interface PumpData extends HydraulicComponent {
  tipo: 'BOMBA'
  curva: PumpCurvePoint[]
  velocidade: number     // RPM
  potenciaNominal: number // kW
  rendimentoNominal: number // %
  npshRequerido: number  // m
  frequencia: number     // Hz
  tensao: string         // '220/380V' | '380/440V'
  fases: number          // 1 | 3
  motorRecomendado?: string
  tubulacaoRecomendada?: string
}

// ── Calculation inputs/outputs ─────────────────────────────────────────────

export interface HydraulicSystemParams {
  vazao: number          // m³/h — vazão de projeto
  alturaGeometrica: number // m — diferença de nível
  comprimentoTubulacao: number // m — comprimento total
  diametroTubulacao: number    // mm — DN interno
  materialTubulacao: 'PVC' | 'PEAD' | 'FERRO_GALVANIZADO' | 'FERRO_FUNDIDO' | 'ACO'
  coeficienteHW?: number       // Coeficiente Hazen-Williams (auto se omitido)
  perdaCargaAcessorios?: number // m — perdas localizadas estimadas
  eficienciaBomba?: number      // decimal (0.6 = 60%)
  reservaTecnica?: number        // % sobre perda de carga (padrão 15%)
}

export interface HydraulicCalculationResult {
  velocidade: number           // m/s
  numeroReynolds: number
  regimeEscoamento: 'LAMINAR' | 'TRANSICAO' | 'TURBULENTO'
  fatorFriccao: number
  perdaCargaUnitaria: number   // m/100m (Hazen-Williams)
  perdaCargaTotal: number      // m
  perdaCargaAcessorios: number // m
  perdaCargaReserva: number    // m
  perdaCargaSistema: number    // m (total com reserva)
  alturaManometricaTotal: number // m.c.a.
  potenciaHidraulica: number   // kW
  potenciaAbsorvida: number    // kW (com η)
  potenciaMotor: number        // kW (potência comercial recomendada)
  vazao: number                // m³/h
  coeficienteHW: number
  advertencias: string[]
}

export interface PumpSelectionResult {
  bomba: PumpData
  pontoOperacao: PumpCurvePoint
  margem: number               // % de margem sobre o ponto de operação
  motorIndicado: string
  tubulacaoRecomendada: string
  advertencias: string[]
  score: number                // 0-100 score de adequação
}

// ── Project hydraulic data ─────────────────────────────────────────────────

export interface HydraulicProject {
  id: string
  projetoId: string          // referência para EngenhariaProject
  nome: string
  parametros: HydraulicSystemParams
  resultado?: HydraulicCalculationResult
  bombaSelecionada?: PumpData
  componentesUtilizados: HydraulicComponent[]
  createdAt: string
  updatedAt: string
}
