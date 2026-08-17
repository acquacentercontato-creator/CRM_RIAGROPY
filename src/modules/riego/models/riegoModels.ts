import type { RiegoMediaType, RiegoSegment } from '@/modules/riego/types/riegoTypes'

export const RIEGO_COLLECTIONS = {
  levantamentos: 'riego_levantamentos',
} as const

export const RIEGO_STORAGE = {
  cacheLevantamentos: 'riagro.riego.levantamentos.v3',
  draftForm: 'riagro.riego.draft.v3',
} as const

export const RIEGO_SEGMENT_LABELS: Record<RiegoSegment, string> = {
  ASPERSAO: 'Aspersao',
  CARRETEL: 'Carretel',
  PIVO: 'Pivo',
  GOTEJAMENTO: 'Gotejamento',
  MICROASPERSAO: 'Microaspersao',
  RECALQUE: 'Recalque',
}

export const RIEGO_MEDIA_FOLDER: Record<RiegoMediaType, string> = {
  FOTO: 'fotos',
  VIDEO: 'videos',
  DOCUMENTO: 'documentos',
}

type RiegoQuestion = { key: string; label: string; required?: boolean }

const RIEGO_COMMON_QUESTIONS: RiegoQuestion[] = [
  { key: 'numeroRegiao', label: 'Número da região' },
  { key: 'telefone', label: 'Telefone' },
  { key: 'email', label: 'E-mail' },
  { key: 'documentoFiscal', label: 'CNPJ/CPF' },
  { key: 'inscricaoEstadualProdutor', label: 'Inscrição estadual/produtor' },
  { key: 'municipio', label: 'Município' },
  { key: 'estado', label: 'Estado/Departamento' },
  { key: 'dataMapeamento', label: 'Data do mapeamento' },
  { key: 'dataApresentacao', label: 'Data para apresentação' },
  { key: 'cultura', label: 'Cultura irrigada' },
  { key: 'variedadeCultura', label: 'Variedade da cultura' },
  { key: 'laminaDesejada', label: 'Lâmina (mm/dia)' },
  { key: 'espacamentoLinhas', label: 'Espaçamento entre linhas (m)' },
  { key: 'espacamentoPlantas', label: 'Espaçamento entre plantas (m)' },
  { key: 'sistemaInstalacao', label: 'Sistema fixo (enterrado) ou móvel' },
  { key: 'passagemPor', label: 'Possui passagem por ponte, bueiro ou rio/córrego' },
  { key: 'operacao', label: 'Operação manual ou automatizada' },
  { key: 'areaHa', label: 'Área total da propriedade (ha)' },
  { key: 'areaIrrigadaHa', label: 'Área a ser irrigada (ha)' },
  { key: 'tipoSolo', label: 'Tipo de solo' },
  { key: 'areaFuturaHa', label: 'Área futura (ha)' },
  { key: 'desnivelMaximo', label: 'Desnível máximo (m)' },
  { key: 'fonteCaptacao', label: 'Fonte de captação' },
  { key: 'tipoDejeto', label: 'Tipo de dejeto' },
  { key: 'numeroLagoasDejeto', label: 'Número de lagoas de dejeto' },
  { key: 'volumeLagoaM3', label: 'Volume da lagoa (m³)' },
  { key: 'numeroAnimais', label: 'Número de animais' },
  { key: 'sistemaTratamento', label: 'Sistema de tratamento existente' },
  { key: 'interesseTratamento', label: 'Interesse em tratamento/geração de energia' },
  { key: 'instalacaoCasaBombas', label: 'Melhor sistema de instalação da casa de bombas' },
  { key: 'diferencaNivelAguaInicioArea', label: 'Diferença entre o nível da água/dejeto e o início da área (m)' },
  { key: 'diferencaBaseBombaNivelAgua', label: 'Diferença entre a base da bomba e o nível da água/dejeto (m)' },
  { key: 'possuiOutorga', label: "Possui outorga d'água" },
  { key: 'outorgaM3Dia', label: 'Volume autorizado pela outorga (m³/dia)' },
  { key: 'preferenciaMotorBomba', label: 'Preferência de motor para a bomba' },
  { key: 'potenciaTratorCv', label: 'Potência do trator (cv)' },
  { key: 'energiaPropriedade', label: 'Energia disponível na propriedade' },
  { key: 'potenciaTransformadorKva', label: 'Potência do transformador (kVA)' },
  { key: 'autorizacaoProjetoOrcamento', label: 'Autorização para desenvolver o projeto hidráulico e orçamento' },
]

const withCommonQuestions = (specificQuestions: RiegoQuestion[]) => [
  ...RIEGO_COMMON_QUESTIONS.map((question) => ({ ...question, required: false })),
  ...specificQuestions,
]

export const RIEGO_SEGMENT_QUESTIONS: Record<RiegoSegment, RiegoQuestion[]> = {
  ASPERSAO: withCommonQuestions([
    { key: 'pressaoTrabalho', label: 'Pressao de trabalho (mca)' },
    { key: 'tipoAspersor', label: 'Tipo de aspersor' },
  ]),
  CARRETEL: withCommonQuestions([
    { key: 'comprimentoFaixa', label: 'Comprimento da faixa (m)' },
    { key: 'diametroMangueira', label: 'Diametro da mangueira' },
    { key: 'vazaoProjeto', label: 'Vazao do projeto' },
  ]),
  PIVO: withCommonQuestions([
    { key: 'raioPivo', label: 'Raio do pivo (m)' },
    { key: 'topografia', label: 'Topografia da area' },
  ]),
  GOTEJAMENTO: withCommonQuestions([
    { key: 'vazaoEmissor', label: 'Vazao do emissor (l/h)' },
  ]),
  MICROASPERSAO: withCommonQuestions([
    { key: 'modeloMicroaspersor', label: 'Modelo de microaspersor' },
    { key: 'vazaoUnitaria', label: 'Vazao unitaria (l/h)' },
  ]),
  RECALQUE: withCommonQuestions([
    { key: 'alturaManometrica', label: 'Altura manometrica total (m)' },
    { key: 'distanciaRecalque', label: 'Distancia de recalque (m)' },
    { key: 'diametroTubulacao', label: 'Diametro da tubulacao' },
  ]),
}
