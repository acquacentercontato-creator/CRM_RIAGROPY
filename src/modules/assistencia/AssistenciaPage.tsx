import { useState } from 'react'
import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { ModuleAttachmentsTab } from '@/shared/attachments'
import { UniversalChecklist } from '@/shared/components/UniversalChecklist'
import { useTranslationService } from '@/shared/hooks/useTranslationService'
import { AssistenciaService } from './services/AssistenciaService'
import type { AssistenciaChamado, AssistenciaStatus } from './types/assistenciaTypes'
import { ASSISTENCIA_STATUS } from './types/assistenciaTypes'
import { useAuth } from '@/auth/AuthContext'

const STATUS_COLOR: Record<AssistenciaStatus, 'default' | 'warning' | 'info' | 'primary' | 'error' | 'success'> = {
  CHAMADO: 'error',
  TRIAGEM: 'warning',
  AGENDAMENTO: 'info',
  TECNICO_CAMPO: 'primary',
  VALIDACAO: 'warning',
  FINALIZADO: 'success',
  GARANTIA: 'default',
  CANCELADO: 'error',
}

export const AssistenciaPage = () => {
  const ts = useTranslationService()
  const { user } = useAuth()
  const [chamados, setChamados] = useState(() => AssistenciaService.list())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selected, setSelected] = useState<AssistenciaChamado | null>(null)
  const [selectedTab, setSelectedTab] = useState(0)
  const [filterStatus, setFilterStatus] = useState<AssistenciaStatus | ''>('')
  const [form, setForm] = useState({ clienteNome: '', tipo: 'CORRETIVA', prioridade: 'MEDIA', descricao: '' })

  const reload = () => setChamados(AssistenciaService.list())

  const handleCreate = () => {
    AssistenciaService.create({
      clienteId: '',
      clienteNome: form.clienteNome,
      tipo: form.tipo as AssistenciaChamado['tipo'],
      prioridade: form.prioridade as AssistenciaChamado['prioridade'],
      descricao: form.descricao,
      responsavel: user?.name ?? 'technical.ass.system',
      dataAbertura: new Date().toISOString(),
      slaHoras: 24,
    })
    reload()
    setDialogOpen(false)
    setForm({ clienteNome: '', tipo: 'CORRETIVA', prioridade: 'MEDIA', descricao: '' })
  }

  const handleStatusChange = (id: string, novoStatus: AssistenciaStatus) => {
    AssistenciaService.updateStatus(id, novoStatus, user?.name ?? 'technical.ass.system')
    reload()
    if (selected?.id === id) setSelected(AssistenciaService.getById(id))
  }

  const metrics = AssistenciaService.getMetrics()

  const filtered = filterStatus ? chamados.filter((c) => c.status === filterStatus) : chamados

  return (
    <Stack spacing={2}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">{ts('pages.assistencia.title')}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          {ts('technical.ass.novoChamado')}
        </Button>
      </Stack>

      <Alert severity="info">{ts('technical.ass.info')}</Alert>

      {/* Métricas */}
      <Grid container spacing={1.5}>
        {[
          { label: ts('technical.kpi.ass.abertas'), value: metrics.abertas, color: 'error.main' },
          { label: ts('technical.kpi.ass.emSla'), value: metrics.emSla, color: 'success.main' },
          { label: ts('technical.kpi.ass.slaVencidos'), value: metrics.slaVencidos, color: 'warning.main' },
          { label: ts('technical.kpi.ass.garantias'), value: metrics.garantias, color: 'primary.main' },
          {
            label: ts('technical.kpi.ass.tempoMedio'),
            value: ts('technical.ass.units.daysShort', { count: metrics.tempoMedioDias }),
            color: 'secondary.main',
          },
        ].map((kpi) => (
          <Grid key={kpi.label} size={{ xs: 6, sm: 4, md: 2 }}>
            <Paper variant="outlined" sx={{ p: 1.5 }}>
              <Typography variant="h5" sx={{ color: kpi.color, fontWeight: 700 }}>{kpi.value}</Typography>
              <Typography variant="caption" color="text.secondary">{kpi.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Filtro */}
      <TextField
        select
        size="small"
        label={ts('common.status')}
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value as AssistenciaStatus | '')}
        sx={{ maxWidth: 200 }}
      >
        <MenuItem value="">{ts('technical.ass.all')}</MenuItem>
        {ASSISTENCIA_STATUS.map((s) => (
          <MenuItem key={s} value={s}>{ts(`technical.ass.status.${s}`)}</MenuItem>
        ))}
      </TextField>

      {/* Lista de chamados */}
      <Stack spacing={1}>
        {filtered.map((chamado) => (
          <Paper
            key={chamado.id}
            variant="outlined"
            sx={{ p: 1.5, cursor: 'pointer' }}
            onClick={() => { setSelected(chamado); setSelectedTab(0) }}
          >
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Stack>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{chamado.codigo}</Typography>
                  <Typography variant="body2">{chamado.clienteNome}</Typography>
                  <Chip label={ts(`technical.ass.tipo.${chamado.tipo}`)} size="small" variant="outlined" />
                </Stack>
                <Typography variant="caption" color="text.secondary" noWrap>{chamado.descricao}</Typography>
              </Stack>
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <Chip
                  label={ts(`technical.ass.prioridade.${chamado.prioridade}`)}
                  size="small"
                  color={chamado.prioridade === 'URGENTE' ? 'error' : chamado.prioridade === 'ALTA' ? 'warning' : 'default'}
                />
                <Chip
                  label={ts(`technical.ass.status.${chamado.status}`)}
                  size="small"
                  color={STATUS_COLOR[chamado.status]}
                />
              </Stack>
            </Stack>
          </Paper>
        ))}
        {filtered.length === 0 && (
          <Typography color="text.secondary">{ts('technical.ass.semChamados')}</Typography>
        )}
      </Stack>

      {/* Detail dialog */}
      {selected && (
        <Dialog open onClose={() => setSelected(null)} fullWidth maxWidth="md">
          <DialogTitle>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <span>{selected.codigo} — {selected.clienteNome}</span>
              <Chip label={ts(`technical.ass.status.${selected.status}`)} size="small" color={STATUS_COLOR[selected.status]} />
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Tabs value={selectedTab} onChange={(_, v) => setSelectedTab(v)} sx={{ mb: 2 }}>
              <Tab label={ts('technical.ass.tabs.detalhes')} />
              <Tab label={ts('technical.ass.tabs.checklist')} />
              <Tab label={ts('technical.ass.tabs.historico')} />
              <Tab label={ts('attachments.tab')} />
            </Tabs>

            {selectedTab === 0 && (
              <Stack spacing={1.5}>
                <Grid container spacing={1}>
                  {[
                    [ts('technical.ass.fields.tipo'), ts(`technical.ass.tipo.${selected.tipo}`)],
                    [ts('technical.ass.fields.prioridade'), ts(`technical.ass.prioridade.${selected.prioridade}`)],
                    [ts('technical.ass.fields.sla'), ts('technical.ass.units.hoursShort', { count: selected.slaHoras })],
                    [
                      ts('technical.ass.fields.responsavel'),
                      selected.responsavel === 'Sistema' || selected.responsavel === 'technical.ass.system'
                        ? ts('technical.ass.system')
                        : selected.responsavel ?? '—',
                    ],
                  ].map(([label, value]) => (
                    <Grid key={label} size={{ xs: 6, md: 3 }}>
                      <Typography variant="caption" color="text.secondary">{label}</Typography>
                      <Typography variant="body2">{value}</Typography>
                    </Grid>
                  ))}
                </Grid>
                <Typography variant="body2">{selected.descricao}</Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                  {ASSISTENCIA_STATUS.filter((s) => s !== selected.status && s !== 'CANCELADO').map((s) => (
                    <Button key={s} size="small" variant="outlined" onClick={() => handleStatusChange(selected.id, s)}>
                      → {ts(`technical.ass.status.${s}`)}
                    </Button>
                  ))}
                </Stack>
              </Stack>
            )}

            {selectedTab === 1 && (
              <UniversalChecklist
                items={selected.checklist}
                title={ts('technical.checklist.title')}
                onChange={(id, done) => {
                  AssistenciaService.updateChecklist(selected.id, id, done)
                  reload()
                  setSelected(AssistenciaService.getById(selected.id))
                }}
              />
            )}

            {selectedTab === 2 && (
              <Stack spacing={1}>
                {selected.historico.map((h) => (
                  <Paper key={h.id} variant="outlined" sx={{ p: 1 }}>
                    <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                      <Chip label={ts(`technical.ass.status.${h.status}`)} size="small" color={STATUS_COLOR[h.status]} />
                      <Typography variant="caption" color="text.secondary">{new Date(h.timestamp).toLocaleString()}</Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {h.descricao === 'Chamado aberto' || h.descricao === 'technical.ass.history.opened'
                        ? ts('technical.ass.history.opened')
                        : h.descricao.startsWith('Status alterado para ') || h.descricao === 'technical.ass.history.statusChanged'
                          ? ts('technical.ass.history.statusChanged', {
                              status: ts(`technical.ass.status.${h.status}`),
                            })
                          : h.descricao}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {h.responsavel === 'Sistema' || h.responsavel === 'technical.ass.system'
                        ? ts('technical.ass.system')
                        : h.responsavel}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            )}

            {selectedTab === 3 && (
              <ModuleAttachmentsTab
                entityId={selected.id}
                entityNome={selected.clienteNome}
                moduloContext="ASSISTENCIA"
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelected(null)}>{ts('actions.close')}</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Create dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{ts('technical.ass.novoChamado')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label={ts('technical.ass.fields.cliente')} value={form.clienteNome} onChange={(e) => setForm({ ...form, clienteNome: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField select fullWidth label={ts('technical.ass.fields.tipo')} value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                {(['PREVENTIVA', 'CORRETIVA', 'GARANTIA', 'INSTALACAO', 'TREINAMENTO'] as const).map((t) => (
                  <MenuItem key={t} value={t}>{ts(`technical.ass.tipo.${t}`)}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField select fullWidth label={ts('technical.ass.fields.prioridade')} value={form.prioridade} onChange={(e) => setForm({ ...form, prioridade: e.target.value })}>
                {(['BAIXA', 'MEDIA', 'ALTA', 'URGENTE'] as const).map((p) => (
                  <MenuItem key={p} value={p}>{ts(`technical.ass.prioridade.${p}`)}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth multiline rows={3} label={ts('technical.ass.fields.descricao')} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>{ts('actions.cancel')}</Button>
          <Button variant="contained" disabled={!form.clienteNome || !form.descricao} onClick={handleCreate}>
            {ts('actions.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
