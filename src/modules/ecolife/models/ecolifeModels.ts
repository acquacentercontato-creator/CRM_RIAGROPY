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
