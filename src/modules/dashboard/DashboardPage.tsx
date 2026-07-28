import { useMemo } from 'react'
import { Alert, Grid, Stack, Typography } from '@mui/material'
import { DashboardFiltersBar } from '@/modules/dashboard/components/DashboardFiltersBar'
import { KpiGrid } from '@/modules/dashboard/components/KpiGrid'
import { LineChartWidget } from '@/modules/dashboard/components/LineChartWidget'
import { BarChartWidget } from '@/modules/dashboard/components/BarChartWidget'
import { PieChartWidget } from '@/modules/dashboard/components/PieChartWidget'
import { AreaChartWidget } from '@/modules/dashboard/components/AreaChartWidget'
import { HeatmapWidget } from '@/modules/dashboard/components/HeatmapWidget'
import { TimelinePanel } from '@/modules/dashboard/components/TimelinePanel'
import { ActivityFeedPanel } from '@/modules/dashboard/components/ActivityFeedPanel'
import { NotificationsPanel } from '@/modules/dashboard/components/NotificationsPanel'
import { AgendaTodayPanel } from '@/modules/dashboard/components/AgendaTodayPanel'
import { DeliveriesPanel } from '@/modules/dashboard/components/DeliveriesPanel'
import { LateItemsPanel } from '@/modules/dashboard/components/LateItemsPanel'
import { QueuePanel } from '@/modules/dashboard/components/QueuePanel'
import { useExecutiveDashboard } from '@/modules/dashboard/hooks/useExecutiveDashboard'

export const DashboardPage = () => {
  const { data, isLoading, role, filters, setFilters, widgets } = useExecutiveDashboard()

  const widgetSet = useMemo(() => new Set(widgets), [widgets])

  const hasWidget = (widget: string) => widgetSet.has(widget)

  if (!data) {
    return (
      <Stack spacing={2}>
        <Typography variant="h4">Dashboard Executivo</Typography>
        <Typography color="text.secondary">{isLoading ? 'Carregando dados executivos...' : 'Sem dados para exibir.'}</Typography>
      </Stack>
    )
  }

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h4">Dashboard Executivo</Typography>
        <Typography color="text.secondary">Visao empresarial consolidada por perfil: {role}</Typography>
      </Stack>

      <Alert severity="info">
        KPIs em tempo real, graficos analiticos, timeline geral, feed de atividades, agenda, atrasos e filtros multi-criterio.
      </Alert>

      {hasWidget('filters') && (
        <DashboardFiltersBar value={filters} options={data.filters} onChange={setFilters} />
      )}

      {hasWidget('kpis') && <KpiGrid kpis={data.kpis} />}

      <Grid container spacing={2}>
        {hasWidget('lineChart') && (
          <Grid size={{ xs: 12, lg: 6 }}>
            <LineChartWidget title="Tendencia de Visitas" points={data.charts.line} />
          </Grid>
        )}

        {hasWidget('barChart') && (
          <Grid size={{ xs: 12, lg: 6 }}>
            <BarChartWidget title="Distribuicao Operacional" points={data.charts.bar} />
          </Grid>
        )}

        {hasWidget('pieChart') && (
          <Grid size={{ xs: 12, lg: 4 }}>
            <PieChartWidget title="Mix de Leads" points={data.charts.pie} />
          </Grid>
        )}

        {hasWidget('areaChart') && (
          <Grid size={{ xs: 12, lg: 8 }}>
            <AreaChartWidget title="Evolucao de Levantamentos" points={data.charts.area} />
          </Grid>
        )}

        {hasWidget('heatmap') && (
          <Grid size={{ xs: 12 }}>
            <HeatmapWidget title="Heatmap de Atividades" cells={data.charts.heatmap} />
          </Grid>
        )}

        {hasWidget('timeline') && (
          <Grid size={{ xs: 12, lg: 6 }}>
            <TimelinePanel items={data.timeline} />
          </Grid>
        )}

        {hasWidget('feed') && (
          <Grid size={{ xs: 12, lg: 6 }}>
            <ActivityFeedPanel items={data.feed} />
          </Grid>
        )}

        {hasWidget('notifications') && (
          <Grid size={{ xs: 12, lg: 6 }}>
            <NotificationsPanel items={data.notifications} />
          </Grid>
        )}

        {hasWidget('agenda') && (
          <Grid size={{ xs: 12, lg: 6 }}>
            <AgendaTodayPanel items={data.agendaToday} />
          </Grid>
        )}

        {hasWidget('deliveries') && (
          <Grid size={{ xs: 12, lg: 6 }}>
            <DeliveriesPanel items={data.nextDeliveries} />
          </Grid>
        )}

        {hasWidget('lateProjects') && (
          <Grid size={{ xs: 12, lg: 6 }}>
            <LateItemsPanel
              title="Projetos Atrasados"
              subtitle="Itens com risco de prazo"
              items={data.lateProjects}
            />
          </Grid>
        )}

        {hasWidget('lateWorks') && (
          <Grid size={{ xs: 12, lg: 6 }}>
            <LateItemsPanel
              title="Obras Atrasadas"
              subtitle="Pendencias operacionais de campo"
              items={data.lateWorks}
            />
          </Grid>
        )}

        {hasWidget('pendencias') && (
          <Grid size={{ xs: 12, lg: 6 }}>
            <QueuePanel
              title="Dashboard de Pendencias"
              subtitle="Itens com atraso, bloqueio ou sem movimentacao"
              items={data.pendencias}
            />
          </Grid>
        )}

        {hasWidget('minhaFila') && (
          <Grid size={{ xs: 12, lg: 6 }}>
            <QueuePanel
              title="Minha Fila"
              subtitle="Itens atribuidos ao meu perfil operacional"
              items={data.minhaFila}
            />
          </Grid>
        )}

        {hasWidget('aguardandoAcao') && (
          <Grid size={{ xs: 12, lg: 6 }}>
            <QueuePanel
              title="Aguardando Minha Acao"
              subtitle="Pendencias que dependem da minha intervencao"
              items={data.aguardandoMinhaAcao}
            />
          </Grid>
        )}

        {hasWidget('projetosParados') && (
          <Grid size={{ xs: 12, lg: 6 }}>
            <QueuePanel
              title="Projetos Parados"
              subtitle="Projetos sem avancos relevantes no periodo"
              items={data.projetosParados}
            />
          </Grid>
        )}

        {hasWidget('obrasAtrasadas') && (
          <Grid size={{ xs: 12, lg: 6 }}>
            <QueuePanel
              title="Obras Atrasadas"
              subtitle="Obras com prazo vencido e acao necessaria"
              items={data.obrasAtrasadas}
            />
          </Grid>
        )}
      </Grid>
    </Stack>
  )
}
