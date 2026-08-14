import type { EcolifeProduct } from '@/modules/ecolife/types/ecolifeTypes'

export const ECOLIFE_COLLECTIONS = { SWINE: 'ecolife_swine', POULTRY: 'ecolife_poultry' } as const
export const ECOLIFE_CACHE = {
  SWINE: 'riagro.ecolife.swine.v1',
  POULTRY: 'riagro.ecolife.poultry.v1',
} as const

export const ECOLIFE_QUESTIONS: Record<EcolifeProduct, readonly string[]> = {
  SWINE: [
    'productionSystem',
    'breedingSows',
    'growthExpectation',
    'birthsPerSow',
    'pigletsBorn',
    'stillborn',
    'stillbornWeight',
    'sowMortality',
    'maternityMortality',
    'nurseryMortality',
    'rearingMortality',
    'finishingMortality',
    'averageDeadWeight',
    'knowsTotalMass',
    'currentDestination',
    'composting',
    'woodShavingsConsumption',
    'woodShavingsCost',
    'laborHours',
    'machineUse',
    'fuelConsumption',
    'usedArea',
    'processTime',
    'finalDestination',
    'problems',
    'futureExpansion',
  ],
  POULTRY: [
    'birdCount',
    'growthPerspective',
    'birdsPerHouse',
    'model',
    'wasteDestination',
    'dailyMass',
    'batchDisposalDestination',
    'transportMethod',
    'containers',
    'availableArea',
    'solidFuel',
    'effluentTreatment',
    'waterAvailability',
    'energyAvailability',
  ],
}

export const ECOLIFE_QUESTION_SECTIONS: Record<
  EcolifeProduct,
  readonly { key: string; questions: readonly string[] }[]
> = {
  SWINE: [
    { key: 'production', questions: ['productionSystem', 'breedingSows', 'growthExpectation', 'birthsPerSow', 'pigletsBorn'] },
    { key: 'mortality', questions: ['stillborn', 'stillbornWeight', 'sowMortality', 'maternityMortality', 'nurseryMortality', 'rearingMortality', 'finishingMortality', 'averageDeadWeight', 'knowsTotalMass'] },
    { key: 'currentProcess', questions: ['currentDestination', 'composting', 'usedArea', 'processTime', 'finalDestination'] },
    { key: 'costs', questions: ['woodShavingsConsumption', 'woodShavingsCost', 'laborHours', 'machineUse', 'fuelConsumption'] },
    { key: 'problems', questions: ['problems'] },
    { key: 'expansion', questions: ['futureExpansion'] },
  ],
  POULTRY: [
    { key: 'production', questions: ['birdCount', 'growthPerspective', 'birdsPerHouse', 'model'] },
    { key: 'currentProcess', questions: ['wasteDestination', 'dailyMass', 'batchDisposalDestination', 'transportMethod', 'containers', 'effluentTreatment'] },
    { key: 'costs', questions: ['solidFuel', 'waterAvailability', 'energyAvailability'] },
    { key: 'expansion', questions: ['availableArea'] },
  ],
}
