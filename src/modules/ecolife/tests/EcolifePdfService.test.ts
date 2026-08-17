import { describe, expect, it } from 'vitest'
import { EcolifePdfService } from '@/modules/ecolife/services/EcolifePdfService'
import type { EcolifeDiagnostic } from '@/modules/ecolife/types/ecolifeTypes'

const diagnostic: EcolifeDiagnostic = {
  id: 'diagnostic-1',
  code: 'ECO-P-0001',
  product: 'POULTRY',
  clientId: 'client-1',
  clientName: 'Cliente Teste',
  propertyName: 'Granja Modelo',
  municipality: 'Bela Vista',
  department: 'Itapúa',
  consultantName: 'Consultor RIAGRO',
  priority: 'ALTA',
  status: 'LEVANTAMENTO',
  expectedRevenue: 10000,
  saleValue: 0,
  riagroCommission: 0,
  answers: { birdCount: '10000 aves', dailyMass: '50 kg/dia' },
  observations: 'Resumo técnico do levantamento.',
  createdAt: '2026-08-17T12:00:00.000Z',
  updatedAt: '2026-08-17T12:00:00.000Z',
  createdBy: 'user-1',
  updatedBy: 'user-1',
  timeline: [],
}

const translate = (key: string) =>
  ({
    'ecolife.locale': 'pt-BR',
    'ecolife.pdf.title': 'RESUMO DO LEVANTAMENTO TÉCNICO',
    'ecolife.pdf.summary': 'Resumo do levantamento',
    'ecolife.pdf.modality': 'Modalidade do levantamento',
    'ecolife.pdf.date': 'Data do levantamento',
    'ecolife.pdf.questionnaire': 'Questionário',
    'ecolife.pdf.footer': 'Tecnologia que impulsiona o agronegócio',
    'ecolife.products.POULTRY': 'AVICULTURA',
    'ecolife.fields.priority': 'Prioridade',
    'ecolife.priorities.ALTA': 'Alta',
    'ecolife.fields.status': 'Status',
    'ecolife.status.LEVANTAMENTO': 'Levantamento',
    'ecolife.fields.client': 'Cliente',
    'ecolife.fields.propertyName': 'Propriedade',
    'ecolife.fields.municipality': 'Município',
    'ecolife.fields.department': 'Departamento',
    'ecolife.fields.consultantName': 'Consultor',
    'ecolife.fields.observations': 'Observações',
    'ecolife.questions.birdCount': 'Número de aves',
    'ecolife.questions.dailyMass': 'Massa diária',
  })[key] || key

describe('EcolifePdfService', () => {
  it('gera arquivo PDF institucional do levantamento', () => {
    const file = EcolifePdfService.createFile(diagnostic, translate)

    expect(file.name).toBe('ECO-P-0001-Granja_Modelo.pdf')
    expect(file.type).toBe('application/pdf')
    expect(file.size).toBeGreaterThan(10_000)
  })
})
