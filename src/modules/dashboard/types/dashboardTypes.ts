import type { AppRole } from '@/shared/types/auth'
import type { NotificationRecord } from '@/shared/services/NotificationService'
import type { TimelineEvent } from '@/shared/types/core'

export type DashboardFilterState = {
  period: 'HOJE' | '7_DIAS' | '30_DIAS' | '90_DIAS' | '12_MESES'
  responsavel: string
  departamento: string
  cliente: string
}

export type DashboardKpi = {
  label: string
  key: string
  value: number | string
  trend?: number
}

export type ChartPoint = {
  label: string
  value: number
}

export type HeatmapCell = {
  x: string
  y: string
  value: number
}

export type DashboardCharts = {
  line: ChartPoint[]
  bar: ChartPoint[]
  pie: ChartPoint[]
  area: ChartPoint[]
  heatmap: HeatmapCell[]
}

export type DashboardDeliveryItem = {
  id: string
  codigo: string
  cliente: string
  data: string
  status: string
  responsavel: string
}

export type DashboardLateItem = {
  id: string
  codigo: string
  cliente: string
  prazo: string
  diasAtraso: number
  status: string
  tipo: 'PROJETO' | 'OBRA'
}

export type DashboardAgendaItem = {
  id: string
  titulo: string
  clienteNome: string
  data: string
  hora: string
  tipo: string
  status: string
  responsavel: string
}

export type DashboardActivityItem = {
  id: string
  type: string
  title: string
  message: string
  createdAt: string
  actorName: string
  department: string
  cliente: string
}

export type DashboardQueueItem = {
  id: string
  codigo: string
  etapa: string
  responsavel: string
  prazo: string
  diasParado: number
  status: string
  origem: 'WORKFLOW' | 'PROJETO' | 'OBRA'
}

export type DashboardExecutiveData = {
  role: AppRole
  kpis: DashboardKpi[]
  charts: DashboardCharts
  timeline: TimelineEvent[]
  feed: DashboardActivityItem[]
  notifications: NotificationRecord[]
  agendaToday: DashboardAgendaItem[]
  nextDeliveries: DashboardDeliveryItem[]
  lateProjects: DashboardLateItem[]
  lateWorks: DashboardLateItem[]
  filters: {
    responsaveis: string[]
    departamentos: string[]
    clientes: string[]
  }
  widgetsByRole: Record<AppRole, string[]>
  pendencias: DashboardQueueItem[]
  minhaFila: DashboardQueueItem[]
  aguardandoMinhaAcao: DashboardQueueItem[]
  projetosParados: DashboardQueueItem[]
  obrasAtrasadas: DashboardQueueItem[]
}
