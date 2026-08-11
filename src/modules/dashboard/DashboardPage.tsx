import { useMemo } from 'react'
import { Alert, Grid, Paper, Stack, Typography } from '@mui/material'
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
import { PermissionService } from '@/shared/auth/PermissionService'
import { useTranslationService } from '@/shared/hooks/useTranslationService'
import { WorkflowPipelineMetrics } from '@/shared/workflow/pipeline/components/WorkflowPipelineMetrics'
import { WorkflowPipelineService } from '@/shared/workflow/pipeline/WorkflowPipelineService'
import { BPEDashboardWidget } from '@/shared/bpe/components/BPEDashboardWidget'
import { BPEOrchestrator } from '@/shared/bpe'
import { AutomationMetricsWidget } from '@/shared/crm-automation/components/AutomationMetricsWidget'
import { AutomationService } from '@/shared/crm-automation'
import { TechnicalKpiPanel } from '@/shared/components/TechnicalKpiPanel'
import { AssistenciaService } from '@/modules/assistencia/services/AssistenciaService'

export const DashboardPage = () => {
  const { data, isLoading, role, filters, setFilters, widgets } = useExecutiveDashboard()
  const canSeeDashboard = PermissionService.canSeeDashboard(role)
  const ts = useTranslationService()

  const widgetSet = useMemo(() => new Set(widgets), [widgets])

  const hasWidget = (widget: string) => widgetSet.has(widget)

  if (!data) {
    return (
      <Stack spacing={2}>
        <Typography variant="h4">{ts('dashboard.title')}</Typography>
        <Typography color="text.secondary">{isLoading ? ts('dashboard.loading') : ts('dashboard.noData')}</Typography>
      </Stack>
    )
  }

  if (!canSeeDashboard) {
    return (
      <Stack spacing={2}>
        <Typography variant="h4">{ts('dashboard.title')}</Typography>
        <Typography color="text.secondary">{ts('dashboard.noAccess')}</Typography>
      </Stack>
    )
  }

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h4">{ts('dashboard.title')}</Typography>
        <Typography color="text.secondary">{ts('dashboard.byRole', { role })}</Typography>
      </Stack>

      <Alert severity="info">{ts('dashboard.info')}</Alert>

      {hasWidget('filters') && (
        <DashboardFiltersBar value={filters} options={data.filters} onChange={setFilters} />
      )}

      {hasWidget('kpis') && <KpiGrid kpis={data.kpis} />}

      <Grid container spacing={2}>
        {hasWidget('lineChart') && (
          <Grid size={{ xs: 12, lg: 6 }}>
            <LineChartWidget title={ts('dashboard.charts.lineTrend')} points={data.charts.line} />
          </Grid>
        )}

        {hasWidget('barChart') && (
          <Grid size={{ xs: 12, lg: 6 }}>
            <BarChartWidget title={ts('dashboard.charts.operationalDist')} points={data.charts.bar} />
          </Grid>
        )}

        {hasWidget('pieChart') && (
          <Grid size={{ xs: 12, lg: 4 }}>
            <PieChartWidget title={ts('dashboard.charts.leadsMix')} points={data.charts.pie} />
          </Grid>
        )}

        {hasWidget('areaChart') && (
          <Grid size={{ xs: 12, lg: 8 }}>
            <AreaChartWidget title={ts('dashboard.charts.surveysEvolution')} points={data.charts.area} />
          </Grid>
        )}

        {hasWidget('heatmap') && (
          <Grid size={{ xs: 12 }}>
            <HeatmapWidget title={ts('dashboard.charts.activityHeatmap')} cells={data.charts.heatmap} />
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
              title={ts('dashboard.panels.lateProjectsTitle')}
              subtitle={ts('dashboard.panels.lateProjectsSubtitle')}
              items={data.lateProjects}
            />
          </Grid>
        )}

        {hasWidget('lateWorks') && (
          <Grid size={{ xs: 12, lg: 6 }}>
            <LateItemsPanel
              title={ts('dashboard.panels.lateWorksTitle')}
              subtitle={ts('dashboard.panels.lateWorksSubtitle')}
              items={data.lateWorks}
            />
          </Grid>
        )}

        {hasWidget('pendencias') && (
          <Grid size={{ xs: 12, lg: 6 }}>
            <QueuePanel
              title={ts('dashboard.panels.pendenciasTitle')}
              subtitle={ts('dashboard.panels.pendenciasSubtitle')}
              items={data.pendencias}
            />
          </Grid>
        )}

        {hasWidget('minhaFila') && (
          <Grid size={{ xs: 12, lg: 6 }}>
            <QueuePanel
              title={ts('dashboard.panels.minhaFilaTitle')}
              subtitle={ts('dashboard.panels.minhaFilaSubtitle')}
              items={data.minhaFila}
            />
          </Grid>
        )}

        {hasWidget('aguardandoAcao') && (
          <Grid size={{ xs: 12, lg: 6 }}>
            <QueuePanel
              title={ts('dashboard.panels.aguardandoAcaoTitle')}
              subtitle={ts('dashboard.panels.aguardandoAcaoSubtitle')}
              items={data.aguardandoMinhaAcao}
            />
          </Grid>
        )}

        {hasWidget('projetosParados') && (
          <Grid size={{ xs: 12, lg: 6 }}>
            <QueuePanel
              title={ts('dashboard.panels.projetosParadosTitle')}
              subtitle={ts('dashboard.panels.projetosParadosSubtitle')}
              items={data.projetosParados}
            />
          </Grid>
        )}

        {hasWidget('obrasAtrasadas') && (
          <Grid size={{ xs: 12, lg: 6 }}>
            <QueuePanel
              title={ts('dashboard.panels.obrasAtrasadasTitle')}
              subtitle={ts('dashboard.panels.obrasAtrasadasSubtitle')}
              items={data.obrasAtrasadas}
            />
          </Grid>
        )}

        {hasWidget('workflowPipeline') && (
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>{ts('workflow.title')}</Typography>
              <WorkflowPipelineMetrics metrics={WorkflowPipelineService.calcularMetricas()} />
            </Paper>
          </Grid>
        )}

        {hasWidget('bpeMetrics') && (
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 2 }}>
              <BPEDashboardWidget metrics={BPEOrchestrator.getDashboardMetrics()} />
            </Paper>
          </Grid>
        )}

        {hasWidget('automationMetrics') && (
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 2 }}>
              <AutomationMetricsWidget
                metrics={AutomationService.getMetrics()}
                tasks={AutomationService.listTasks()}
              />
            </Paper>
          </Grid>
        )}

        {hasWidget('technicalKpis') && (
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 2 }}>
              <TechnicalKpiPanel
                engenharia={{ emRevisao: 0, aguardandoAprovacao: 0, liberados: 0, tempoMedioDias: 7, slaVencidos: 0 }}
                obras={{ emAndamento: 0, atrasadas: 0, emEntrega: 0, tempoMedioDias: 15, slaVencidos: 0 }}
                assistencia={AssistenciaService.getMetrics()}
              />
            </Paper>
          </Grid>
        )}
      </Grid>
    </Stack>
  )
}
