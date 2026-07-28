import type { DashboardFilterState } from '@/modules/dashboard/types/dashboardTypes'

export const defaultDashboardFilters: DashboardFilterState = {
  period: '30_DIAS',
  responsavel: 'TODOS',
  departamento: 'TODOS',
  cliente: 'TODOS',
}

export const cutoffFromPeriod = (period: DashboardFilterState['period']): Date => {
  const now = new Date()

  if (period === 'HOJE') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  }

  if (period === '7_DIAS') {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  }

  if (period === '30_DIAS') {
    return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  }

  if (period === '90_DIAS') {
    return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
  }

  return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
}

export const isAfterCutoff = (value: string, cutoff: Date) => {
  if (!value) return false
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return false
  return parsed >= cutoff
}

export const toCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export const percent = (partial: number, total: number) => {
  if (total <= 0) return 0
  return Number(((partial / total) * 100).toFixed(1))
}

export const daysLate = (dateString: string) => {
  if (!dateString) return 0
  const deadline = new Date(dateString)
  if (Number.isNaN(deadline.getTime())) return 0
  const diff = Date.now() - deadline.getTime()
  if (diff <= 0) return 0
  return Math.floor(diff / (24 * 60 * 60 * 1000))
}

export const monthLabel = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/D'
  return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getFullYear()).slice(-2)}`
}
