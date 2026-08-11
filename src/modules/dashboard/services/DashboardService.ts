import { ComercialService } from '@/modules/comercial/services/ComercialService'
import { EngenhariaService } from '@/modules/engenharia/services/EngenhariaService'
import { ImotoService } from '@/modules/imoto/services/ImotoService'
import { ObrasService } from '@/modules/obras/services/ObrasService'
import { RiegoService } from '@/modules/riego/services/RiegoService'
import type {
  DashboardExecutiveData,
  DashboardFilterState,
  DashboardQueueItem,
  HeatmapCell,
} from '@/modules/dashboard/types/dashboardTypes'
import { dashboardFilterSchema } from '@/modules/dashboard/validators/dashboardValidators'
import {
  cutoffFromPeriod,
  daysLate,
  isAfterCutoff,
  monthLabel,
  percent,
  toCurrency,
} from '@/modules/dashboard/utils/dashboardUtils'
import { NotificationService } from '@/shared/services/NotificationService'
import { TimelineService } from '@/shared/services/TimelineService'
import { PermissionService } from '@/shared/auth/PermissionService'
import type { AppRole } from '@/shared/types/auth'
import type { TimelineEvent } from '@/shared/types/core'
import { WorkflowRepository } from '@/shared/workflow/WorkflowRepository'

const WORKFLOW_REPOSITORY = new WorkflowRepository()

const STATUS_CONCLUIDO_PROJETO = 'PROJETO COMPLETO'
const STATUS_REVISAO_PROJETO = 'REVISAO'
const STATUS_OBRA_ANDAMENTO = ['PLANEJAMENTO', 'EXECUCAO', 'ACOMPANHAMENTO']
const STATUS_OBRA_FINAL = ['ENTREGA', 'ENCERRAMENTO']

const daysWithoutMovement = (dateIso?: string) => {
  if (!dateIso) return 0
  const date = new Date(dateIso)
  if (Number.isNaN(date.getTime())) return 0
  const diffMs = Date.now() - date.getTime()
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
}

const roleWidgets: Record<AppRole, string[]> = {
  ADMINISTRADOR: [
    'kpis',
    'filters',
    'lineChart',
    'barChart',
    'pieChart',
    'areaChart',
    'heatmap',
    'timeline',
    'feed',
    'notifications',
    'agenda',
    'deliveries',
    'lateProjects',
    'lateWorks',
    'pendencias',
    'minhaFila',
    'aguardandoAcao',
    'projetosParados',
    'obrasAtrasadas',
    'workflowPipeline',
    'bpeMetrics',
    'automationMetrics',
    'technicalKpis',
  ],
  GERENTE: [
    'kpis',
    'filters',
    'barChart',
    'pieChart',
    'areaChart',
    'timeline',
    'feed',
    'notifications',
    'agenda',
    'deliveries',
    'lateProjects',
    'lateWorks',
    'pendencias',
    'minhaFila',
    'aguardandoAcao',
    'projetosParados',
    'obrasAtrasadas',
    'workflowPipeline',
    'bpeMetrics',
    'automationMetrics',
    'technicalKpis',
  ],
  PROJETISTA: [
    'kpis',
    'filters',
    'lineChart',
    'areaChart',
    'heatmap',
    'timeline',
    'feed',
    'deliveries',
    'lateProjects',
    'minhaFila',
    'aguardandoAcao',
    'projetosParados',
  ],
  COMERCIAL: [
    'kpis',
    'filters',
    'lineChart',
    'barChart',
    'pieChart',
    'notifications',
    'agenda',
    'feed',
    'pendencias',
    'minhaFila',
    'aguardandoAcao',
  ],
}

const normalize = (value: string) => value.trim().toLowerCase()

const toDepartment = (clienteNome: string, departmentsByCliente: Map<string, string>) => {
  return departmentsByCliente.get(normalize(clienteNome)) ?? 'SEM_DEPARTAMENTO'
}

const buildHeatmap = (events: TimelineEvent[]): HeatmapCell[] => {
  const days = [
    'dashboard.weekday.sun',
    'dashboard.weekday.mon',
    'dashboard.weekday.tue',
    'dashboard.weekday.wed',
    'dashboard.weekday.thu',
    'dashboard.weekday.fri',
    'dashboard.weekday.sat',
  ]
  const buckets = new Map<string, number>()

  events.forEach((event) => {
    const date = new Date(event.createdAt)
    if (Number.isNaN(date.getTime())) return
    const key = `${days[date.getDay()]}-${date.getHours()}`
    buckets.set(key, (buckets.get(key) ?? 0) + 1)
  })

  const heatmap: HeatmapCell[] = []

  days.forEach((day) => {
    for (let hour = 0; hour < 24; hour += 3) {
      const key = `${day}-${hour}`
      heatmap.push({
        x: day,
        y: `${String(hour).padStart(2, '0')}h`,
        value: buckets.get(key) ?? 0,
      })
    }
  })

  return heatmap
}

const filterByCommonCriteria = <T extends { clienteNome?: string; responsavel?: string; updatedAt?: string }>(
  items: T[],
  filters: DashboardFilterState,
  departmentsByCliente: Map<string, string>,
  cutoff: Date
) => {
  return items.filter((item) => {
    const cliente = item.clienteNome ?? 'SEM_CLIENTE'
    const responsavel = item.responsavel ?? 'SEM_RESPONSAVEL'
    const departamento = toDepartment(cliente, departmentsByCliente)

    const okPeriodo = item.updatedAt ? isAfterCutoff(item.updatedAt, cutoff) : true
    const okResponsavel = filters.responsavel === 'TODOS' || responsavel === filters.responsavel
    const okDepartamento = filters.departamento === 'TODOS' || departamento === filters.departamento
    const okCliente = filters.cliente === 'TODOS' || cliente === filters.cliente

    return okPeriodo && okResponsavel && okDepartamento && okCliente
  })
}

export const DashboardService = {
  async loadExecutiveDashboard(role: AppRole, rawFilters: DashboardFilterState): Promise<DashboardExecutiveData> {
    const parsed = dashboardFilterSchema.safeParse(rawFilters)
    const filters = parsed.success
      ? parsed.data
      : {
          period: '30_DIAS' as const,
          responsavel: 'TODOS',
          departamento: 'TODOS',
          cliente: 'TODOS',
        }

    const cutoff = cutoffFromPeriod(filters.period)

    const [clientes, visitas, oportunidades, riego, imoto, engenharia, obras, notifications, timelineAll, workflows, agenda] =
      await Promise.all([
        ComercialService.listClientes(),
        ComercialService.listVisitas(),
        ComercialService.listOportunidades(),
        RiegoService.list(),
        ImotoService.list(),
        EngenhariaService.list(),
        ObrasService.list(),
        Promise.resolve(NotificationService.list()),
        Promise.resolve(TimelineService.listAll()),
        WORKFLOW_REPOSITORY.list(),
        ComercialService.listAgenda(),
      ])

    const departmentsByCliente = new Map<string, string>()
    clientes.forEach((cliente) => {
      departmentsByCliente.set(normalize(cliente.nomeFantasia || cliente.razaoSocial), cliente.departamento || 'SEM_DEPARTAMENTO')
    })

    const visitasFiltered = filterByCommonCriteria(
      visitas.map((item) => ({
        ...item,
        responsavel: item.responsavel,
        updatedAt: item.updatedAt,
      })),
      filters,
      departmentsByCliente,
      cutoff
    )

    const levantamentos = [
      ...riego.map((item) => ({
        clienteNome: item.clienteNome,
        responsavel: item.responsavel,
        updatedAt: item.updatedAt,
      })),
      ...imoto.map((item) => ({
        clienteNome: item.clienteNome,
        responsavel: item.responsavelTecnico,
        updatedAt: item.updatedAt,
      })),
    ]

    const levantamentosFiltered = filterByCommonCriteria(levantamentos, filters, departmentsByCliente, cutoff)

    const engenhariaFiltered = filterByCommonCriteria(
      engenharia.map((item) => ({
        ...item,
        responsavel: item.updatedBy,
        updatedAt: item.updatedAt,
      })),
      filters,
      departmentsByCliente,
      cutoff
    )

    const obrasFiltered = filterByCommonCriteria(
      obras.map((item) => ({
        ...item,
        responsavel: item.responsavelObra,
        updatedAt: item.updatedAt,
      })),
      filters,
      departmentsByCliente,
      cutoff
    )

    const clientesFiltered = clientes.filter((cliente) => {
      const clienteNome = cliente.nomeFantasia || cliente.razaoSocial
      const okPeriodo = isAfterCutoff(cliente.updatedAt, cutoff)
      const okResponsavel = filters.responsavel === 'TODOS' || cliente.responsavelComercial === filters.responsavel
      const okDepartamento = filters.departamento === 'TODOS' || cliente.departamento === filters.departamento
      const okCliente = filters.cliente === 'TODOS' || clienteNome === filters.cliente
      return okPeriodo && okResponsavel && okDepartamento && okCliente
    })

    const oportunidadesFiltered = oportunidades.filter((op) => {
      const okCliente = filters.cliente === 'TODOS' || op.clienteNome === filters.cliente
      const departamento = toDepartment(op.clienteNome, departmentsByCliente)
      const okDepartamento = filters.departamento === 'TODOS' || departamento === filters.departamento
      return okCliente && okDepartamento
    })

    const projetosRevisao = engenhariaFiltered.filter((item) => item.status === STATUS_REVISAO_PROJETO)
    const projetosConcluidos = engenhariaFiltered.filter((item) => item.status === STATUS_CONCLUIDO_PROJETO)
    const obrasAndamento = obrasFiltered.filter((item) => STATUS_OBRA_ANDAMENTO.includes(item.status))
    const obrasFinalizadas = obrasFiltered.filter((item) => STATUS_OBRA_FINAL.includes(item.status))

    const assistencias = workflows.filter((workflow) => workflow.status === 'ASSISTÊNCIA')

    const alta = oportunidadesFiltered.filter((item) => item.nivel === 'ALTA').length
    const media = oportunidadesFiltered.filter((item) => item.nivel === 'MEDIA').length
    const baixa = oportunidadesFiltered.filter((item) => item.nivel === 'BAIXA').length

    const faturamentoPrevisto = alta * 120000 + media * 65000 + baixa * 25000

    const clientesAtivos = clientesFiltered.filter((item) => item.status === 'ATIVO').length
    const conversaoComercial = percent(clientesAtivos, Math.max(clientesFiltered.length, 1))

    const timelineFiltered = timelineAll
      .filter((event) => isAfterCutoff(event.createdAt, cutoff))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    const feed = timelineFiltered.slice(0, 120).map((event) => {
      const cliente = event.message.match(/([A-Z]{2,}-\d{5}|\d{2}[A-Z]\d{4}\.\d+)/)?.[0] ?? 'SEM_CLIENTE'
      const dept = filters.cliente !== 'TODOS' ? toDepartment(filters.cliente, departmentsByCliente) : 'GERAL'

      return {
        id: event.id,
        type: event.type,
        title: event.action || event.type,
        message: event.message,
        createdAt: event.createdAt,
        actorName: event.actorName,
        department: dept,
        cliente,
      }
    })

    const today = new Date().toISOString().slice(0, 10)
    const agendaToday = agenda
      .filter((item) => item.data === today)
      .map((item) => ({
        id: item.id,
        titulo: item.titulo,
        clienteNome: item.clienteNome,
        data: item.data,
        hora: item.hora,
        tipo: item.tipo,
        status: item.status,
        responsavel: 'COMERCIAL',
      }))

    const nextDeliveries = obrasFiltered
      .filter((item) => item.dataEntrega)
      .sort((a, b) => a.dataEntrega.localeCompare(b.dataEntrega))
      .slice(0, 10)
      .map((item) => ({
        id: item.id,
        codigo: item.codigoObra,
        cliente: item.clienteNome,
        data: item.dataEntrega,
        status: item.status,
        responsavel: item.responsavelObra,
      }))

    const lateProjects = engenhariaFiltered
      .filter((item) => item.status !== STATUS_CONCLUIDO_PROJETO)
      .map((item) => ({
        id: item.id,
        codigo: item.codigoProjeto,
        cliente: item.clienteNome,
        prazo: item.updatedAt.slice(0, 10),
        diasAtraso: daysLate(item.updatedAt),
        status: item.status,
        tipo: 'PROJETO' as const,
      }))
      .filter((item) => item.diasAtraso > 20)
      .sort((a, b) => b.diasAtraso - a.diasAtraso)
      .slice(0, 10)

    const lateWorks = obrasFiltered
      .filter((item) => item.status !== 'ENCERRAMENTO' && item.status !== 'ENTREGA')
      .map((item) => ({
        id: item.id,
        codigo: item.codigoObra,
        cliente: item.clienteNome,
        prazo: item.dataPrevista,
        diasAtraso: daysLate(item.dataPrevista),
        status: item.status,
        tipo: 'OBRA' as const,
      }))
      .filter((item) => item.diasAtraso > 0)
      .sort((a, b) => b.diasAtraso - a.diasAtraso)
      .slice(0, 10)

    const workflowQueue: DashboardQueueItem[] = workflows
      .map((workflow) => {
        const stage = workflow.etapas?.[workflow.status]
        const latestMovement = workflow.timeline[workflow.timeline.length - 1]?.criadoEm ?? workflow.atualizadoEm

        return {
          id: workflow.id,
          codigo: workflow.codigoOficial,
          etapa: workflow.status,
          responsavel: stage?.responsavel || 'SEM_RESPONSAVEL',
          prazo: stage?.prazo?.slice(0, 10) ?? '',
          diasParado: daysWithoutMovement(latestMovement),
          status: workflow.status,
          origem: 'WORKFLOW' as const,
        }
      })
      .sort((a, b) => b.diasParado - a.diasParado)

    const pendencias = workflowQueue
      .filter((item) => item.diasParado >= 3 || (item.prazo && daysLate(item.prazo) > 0))
      .slice(0, 20)

    const resolvedRole = PermissionService.resolveRole(role)
    const responsavelAtual = resolvedRole ? resolvedRole.toUpperCase() : role

    const minhaFila = workflowQueue
      .filter((item) => normalize(item.responsavel).includes(normalize(responsavelAtual)))
      .slice(0, 20)

    const aguardandoMinhaAcao = workflowQueue
      .filter((item) => normalize(item.responsavel).includes(normalize(responsavelAtual)) && item.diasParado > 0)
      .slice(0, 20)

    const projetosParados = engenhariaFiltered
      .map((item) => ({
        id: item.id,
        codigo: item.codigoProjeto,
        etapa: item.status,
        responsavel: item.updatedBy || 'SEM_RESPONSAVEL',
        prazo: item.updatedAt.slice(0, 10),
        diasParado: daysWithoutMovement(item.updatedAt),
        status: item.status,
        origem: 'PROJETO' as const,
      }))
      .filter((item) => item.diasParado >= 7)
      .sort((a, b) => b.diasParado - a.diasParado)
      .slice(0, 20)

    const obrasAtrasadas = obrasFiltered
      .map((item) => ({
        id: item.id,
        codigo: item.codigoObra,
        etapa: item.status,
        responsavel: item.responsavelObra,
        prazo: item.dataPrevista,
        diasParado: daysWithoutMovement(item.updatedAt),
        status: item.status,
        origem: 'OBRA' as const,
      }))
      .filter((item) => item.prazo && daysLate(item.prazo) > 0)
      .sort((a, b) => daysLate(b.prazo) - daysLate(a.prazo))
      .slice(0, 20)

    const lineMap = new Map<string, number>()
    visitasFiltered.forEach((item) => {
      const key = monthLabel(item.updatedAt)
      lineMap.set(key, (lineMap.get(key) ?? 0) + 1)
    })

    const areaMap = new Map<string, number>()
    levantamentosFiltered.forEach((item) => {
      const key = monthLabel(item.updatedAt || new Date().toISOString())
      areaMap.set(key, (areaMap.get(key) ?? 0) + 1)
    })

    const kpis = [
      { key: 'clientes', label: 'dashboard.kpi.clients', value: clientesFiltered.length },
      { key: 'leads', label: 'dashboard.kpi.leads', value: oportunidadesFiltered.length },
      { key: 'visitas', label: 'dashboard.kpi.visits', value: visitasFiltered.length },
      { key: 'levantamentos', label: 'dashboard.kpi.surveys', value: levantamentosFiltered.length },
      { key: 'projetos', label: 'dashboard.kpi.projects', value: engenhariaFiltered.length },
      { key: 'projetosRevisao', label: 'dashboard.kpi.projectsInReview', value: projetosRevisao.length },
      { key: 'projetosConcluidos', label: 'dashboard.kpi.completedProjects', value: projetosConcluidos.length },
      { key: 'obrasAndamento', label: 'dashboard.kpi.worksInProgress', value: obrasAndamento.length },
      { key: 'obrasFinalizadas', label: 'dashboard.kpi.completedWorks', value: obrasFinalizadas.length },
      { key: 'assistencias', label: 'dashboard.kpi.assistance', value: assistencias.length },
      { key: 'faturamentoPrevisto', label: 'dashboard.kpi.expectedRevenue', value: toCurrency(faturamentoPrevisto) },
      { key: 'negociacoes', label: 'dashboard.kpi.negotiations', value: alta + media },
      { key: 'conversaoComercial', label: 'dashboard.kpi.commercialConversion', value: `${conversaoComercial}%` },
    ]

    const responsaveis = Array.from(
      new Set([
        ...clientes.map((item) => item.responsavelComercial),
        ...visitas.map((item) => item.responsavel),
        ...riego.map((item) => item.responsavel),
        ...imoto.map((item) => item.responsavelTecnico),
        ...obras.map((item) => item.responsavelObra),
      ])
    )
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b))

    const departamentos = Array.from(new Set(clientes.map((item) => item.departamento))).filter(Boolean).sort()
    const clientesList = Array.from(
      new Set(clientes.map((item) => item.nomeFantasia || item.razaoSocial).filter(Boolean))
    ).sort()

    return {
      role,
      kpis,
      charts: {
        line: Array.from(lineMap.entries()).map(([label, value]) => ({ label, value })),
        bar: [
          { label: 'dashboard.chart.projects', value: engenhariaFiltered.length },
          { label: 'dashboard.chart.review', value: projetosRevisao.length },
          { label: 'dashboard.chart.completed', value: projetosConcluidos.length },
          { label: 'dashboard.chart.works', value: obrasFiltered.length },
          { label: 'dashboard.chart.inProgress', value: obrasAndamento.length },
          { label: 'dashboard.chart.finalized', value: obrasFinalizadas.length },
        ],
        pie: [
          { label: 'dashboard.chart.highLeads', value: alta },
          { label: 'dashboard.chart.mediumLeads', value: media },
          { label: 'dashboard.chart.lowLeads', value: baixa },
        ],
        area: Array.from(areaMap.entries()).map(([label, value]) => ({ label, value })),
        heatmap: buildHeatmap(timelineFiltered),
      },
      timeline: timelineFiltered.slice(0, 80),
      feed: feed.slice(0, 80),
      notifications: notifications.slice(0, 40),
      agendaToday,
      nextDeliveries,
      lateProjects,
      lateWorks,
      filters: {
        responsaveis,
        departamentos,
        clientes: clientesList,
      },
      widgetsByRole: roleWidgets,
      pendencias,
      minhaFila,
      aguardandoMinhaAcao,
      projetosParados,
      obrasAtrasadas,
    }
  },
}
