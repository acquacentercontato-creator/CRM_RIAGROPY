/**
 * Painel de Suprimentos — fluxo completo:
 * Lista Materiais → Reserva Estoque → Cotação → Pedido → Obra
 */

import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import WarningIcon from '@mui/icons-material/Warning'
import { MaterialListService } from '../engine/DocumentServices'
import type { MemorialInput } from '../engine/DocumentServices'
import {
  CotacaoService,
  PedidoService,
  ReservaService,
} from '../engine/SuprimentosServices'
import type { Cotacao, FornecedorItem, Pedido, ReservaEstoque } from '../engine/SuprimentosServices'
import { HydraulicCalculations } from '../engine/HydraulicCalculations'
import type { HydraulicSystemParams } from '../types/hydraulicTypes'
import { useAuth } from '@/auth/AuthContext'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

const STATUS_COLOR = {
  DISPONIVEL: 'success',
  RESERVADO: 'default',
  INDISPONIVEL: 'error',
  PARCIAL: 'warning',
  RASCUNHO: 'default',
  RESERVADA: 'success',
  PARCIAL_R: 'warning',
  LIBERADA: 'info',
  CANCELADA: 'error',
  ABERTA: 'warning',
  RESPONDIDA: 'info',
  APROVADA: 'success',
  ENVIADO: 'info',
  CONFIRMADO: 'success',
  CONCLUIDO: 'success',
} as const

// ── Mini-form para fornecedor ─────────────────────────────────────────────

interface FornecedorFormProps {
  onAdd: (f: FornecedorItem) => void
}

const FornecedorForm = ({ onAdd }: FornecedorFormProps) => {
  const ts = useTranslationService()
  const [f, setF] = useState<FornecedorItem>({ fornecedor: '', prazoEntrega: 7, precoUnitario: 0 })

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-end', flexWrap: 'wrap', gap: 0.5 }}>
      <TextField size="small" label={ts('sup.cotacao.fornecedor')} value={f.fornecedor}
        onChange={(e) => setF({ ...f, fornecedor: e.target.value })} sx={{ minWidth: 140 }} />
      <TextField size="small" label={ts('sup.cotacao.preco')} type="number" value={f.precoUnitario}
        onChange={(e) => setF({ ...f, precoUnitario: Number(e.target.value) })} sx={{ width: 110 }}
        slotProps={{ input: { startAdornment: <Typography variant="caption" sx={{ mr: 0.5 }}>R$</Typography> } }} />
      <TextField size="small" label={ts('sup.cotacao.prazo')} type="number" value={f.prazoEntrega}
        onChange={(e) => setF({ ...f, prazoEntrega: Number(e.target.value) })} sx={{ width: 80 }}
        slotProps={{ input: { endAdornment: <Typography variant="caption">d</Typography> } }} />
      <IconButton size="small" color="primary" disabled={!f.fornecedor || f.precoUnitario <= 0}
        onClick={() => { onAdd(f); setF({ fornecedor: '', prazoEntrega: 7, precoUnitario: 0 }) }}>
        <AddIcon />
      </IconButton>
    </Stack>
  )
}

// ── Main Panel ────────────────────────────────────────────────────────────

const defaultParams: HydraulicSystemParams = {
  vazao: 30, alturaGeometrica: 20, comprimentoTubulacao: 500,
  diametroTubulacao: 75, materialTubulacao: 'PVC', reservaTecnica: 15,
}

export const ProcurementPanel = () => {
  const ts = useTranslationService()
  const { user } = useAuth()

  const [step, setStep] = useState(0)
  const [nomeProjeto, setNomeProjeto] = useState('')
  const [nomeCliente, setNomeCliente] = useState('')
  const [params, setParams] = useState<HydraulicSystemParams>(defaultParams)

  const [reserva, setReserva] = useState<ReservaEstoque | null>(null)
  const [cotacao, setCotacao] = useState<Cotacao | null>(null)
  const [pedido, setPedido] = useState<Pedido | null>(null)

  const [cotacaoDialogOpen, setCotacaoDialogOpen] = useState(false)
  const [pedidoDialogOpen, setPedidoDialogOpen] = useState(false)
  const [pedidoForm, setPedidoForm] = useState({ condicoesPagamento: '50% entrada + 50% entrega', enderecoEntrega: '', observacoes: '' })

  const metrics = PedidoService.getMetrics()

  // ── Step 0: Materiais ──────────────────────────────────────────────────

  const handleGerarReserva = () => {
    const resultado = HydraulicCalculations.calcular(params)
    const input: MemorialInput = {
      nomeProjeto, nomeCliente, nomeResponsavel: user?.name ?? 'RT',
      crea: '', municipio: '', estado: '', areaIrrigada: 10,
      culturaIrrigada: 'Soja', sistemaIrrigacao: 'ASPERSAO',
      fonteDagua: ts('doc.defaults.well'), params, resultado,
    }
    const lista = MaterialListService.gerar(input)

    const novaReserva = ReservaService.criar({
      projetoId: nomeProjeto.replace(/\s/g, '-').toLowerCase() + '-' + Date.now(),
      nomeProjeto, nomeCliente,
      itens: lista.itens,
      criadoPor: user?.name ?? 'Sistema',
    })

    setReserva(novaReserva)
    setStep(1)
  }

  // ── Step 2: Cotação ───────────────────────────────────────────────────

  const handleGerarCotacao = () => {
    if (!reserva) return
    const nova = CotacaoService.criar({ reserva })
    setCotacao(nova)
    setCotacaoDialogOpen(true)
  }

  const handleAddFornecedor = (itemIdx: number, f: FornecedorItem) => {
    if (!cotacao) return
    const atualizada = CotacaoService.adicionarFornecedor(cotacao.id, itemIdx, f)
    if (atualizada) setCotacao(atualizada)
  }

  const handleSelecionarFornecedor = (itemIdx: number, nome: string) => {
    if (!cotacao) return
    const atualizada = CotacaoService.selecionarFornecedor(cotacao.id, itemIdx, nome)
    if (atualizada) setCotacao(atualizada)
  }

  const handleAprovarCotacao = () => {
    if (!cotacao) return
    const aprovada = CotacaoService.aprovar(cotacao.id, user?.name ?? ts('common.user'))
    if (aprovada) { setCotacao(aprovada); setCotacaoDialogOpen(false); setStep(2) }
  }

  // ── Step 3: Pedido ────────────────────────────────────────────────────

  const handleGerarPedido = () => {
    if (!cotacao) return
    const novo = PedidoService.criarDeCotacao(cotacao, pedidoForm)
    setPedido(novo)
    setPedidoDialogOpen(false)
    setStep(3)
  }

  const handleEnviarPedido = () => {
    if (!pedido) return
    const enviado = PedidoService.enviar(pedido.id)
    if (enviado) { setPedido(enviado); setStep(4) }
  }

  const steps = [
    ts('sup.steps.materiais'),
    ts('sup.steps.reserva'),
    ts('sup.steps.cotacao'),
    ts('sup.steps.pedido'),
    ts('sup.steps.obra'),
  ]

  return (
    <Stack spacing={2}>
      {/* KPI bar */}
      <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
        {[
          { label: ts('sup.kpi.pedidosPendentes'), value: metrics.pedidosPendentes, color: 'warning' },
          { label: ts('sup.kpi.pedidosConfirmados'), value: metrics.pedidosConfirmados, color: 'success' },
          { label: ts('sup.kpi.cotacoesAbertas'), value: metrics.cotacoesAbertas, color: 'info' },
          { label: ts('sup.kpi.reservasPendentes'), value: metrics.reservasPendentes, color: 'warning' },
          { label: ts('sup.kpi.valorTotal'), value: `R$ ${metrics.valorTotalPedidos.toLocaleString('pt-BR', { notation: 'compact' })}`, color: 'primary' },
        ].map(({ label, value, color }) => (
          <Chip key={label} label={`${label}: ${value}`} size="small"
            color={color as 'warning' | 'success' | 'info' | 'primary'} variant="outlined" />
        ))}
      </Stack>

      {/* Project inputs */}
      {step === 0 && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>{ts('sup.projeto.titulo')}</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth size="small" label={ts('doc.form.nomeProjeto')} value={nomeProjeto} onChange={(e) => setNomeProjeto(e.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth size="small" label={ts('doc.form.nomeCliente')} value={nomeCliente} onChange={(e) => setNomeCliente(e.target.value)} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <TextField fullWidth size="small" type="number" label={ts('hydraulic.calc.vazao')} value={params.vazao}
                onChange={(e) => setParams({ ...params, vazao: Number(e.target.value) })}
                slotProps={{ input: { endAdornment: <Typography variant="caption">m³/h</Typography> } }} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <TextField fullWidth size="small" type="number" label={ts('hydraulic.calc.comprimento')} value={params.comprimentoTubulacao}
                onChange={(e) => setParams({ ...params, comprimentoTubulacao: Number(e.target.value) })}
                slotProps={{ input: { endAdornment: <Typography variant="caption">m</Typography> } }} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <TextField fullWidth size="small" type="number" label={ts('hydraulic.calc.diametro')} value={params.diametroTubulacao}
                onChange={(e) => setParams({ ...params, diametroTubulacao: Number(e.target.value) })}
                slotProps={{ input: { endAdornment: <Typography variant="caption">mm</Typography> } }} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <TextField fullWidth size="small" type="number" label={ts('hydraulic.calc.alturaGeom')} value={params.alturaGeometrica}
                onChange={(e) => setParams({ ...params, alturaGeometrica: Number(e.target.value) })}
                slotProps={{ input: { endAdornment: <Typography variant="caption">m</Typography> } }} />
            </Grid>
          </Grid>
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" disabled={!nomeProjeto || !nomeCliente} onClick={handleGerarReserva}>
              {ts('sup.gerarLista')}
            </Button>
          </Box>
        </Paper>
      )}

      {/* Stepper */}
      {step > 0 && (
        <Stepper activeStep={step} orientation="vertical">
          {/* Step 1 — Reserva */}
          <Step completed={step > 1}>
            <StepLabel optional={reserva && (
              <Chip size="small" label={reserva.numero}
                color={reserva.status === 'RESERVADA' ? 'success' : 'warning'} />
            )}>
              {steps[1]}
            </StepLabel>
            <StepContent>
              {reserva && (
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                    {reserva.itens.map((item) => (
                      <Chip key={item.codigo} size="small" icon={item.statusItem === 'DISPONIVEL' ? <CheckCircleIcon /> : <WarningIcon />}
                        label={`${item.codigo} ${item.quantidadeAtendida}/${item.quantidadeSolicitada} ${item.unidade}`}
                        color={STATUS_COLOR[item.statusItem] as 'success' | 'warning' | 'error' | 'default'} variant="outlined" />
                    ))}
                  </Stack>

                  {reserva.itens.some((i) => i.quantidadePendente > 0) ? (
                    <Alert severity="warning" sx={{ py: 0 }}>
                      <Typography variant="caption">
                        {ts('sup.reserva.itensFaltantes', {
                          count: reserva.itens.filter((i) => i.quantidadePendente > 0).length
                        })}
                      </Typography>
                    </Alert>
                  ) : (
                    <Alert severity="success" sx={{ py: 0 }}>
                      <Typography variant="caption">{ts('sup.reserva.todosDisponiveis')}</Typography>
                    </Alert>
                  )}

                  <Stack direction="row" spacing={1}>
                    {reserva.itens.some((i) => i.quantidadePendente > 0) && (
                      <Button size="small" variant="contained" onClick={handleGerarCotacao}>
                        {ts('sup.gerarCotacao')}
                      </Button>
                    )}
                    <Button size="small" variant="outlined" onClick={() => setStep(2)}>
                      {ts('sup.pularParaCotacao')} →
                    </Button>
                  </Stack>
                </Stack>
              )}
            </StepContent>
          </Step>

          {/* Step 2 — Cotação */}
          <Step completed={step > 2}>
            <StepLabel optional={cotacao && (
              <Chip size="small" label={`${cotacao.numero} · R$ ${(cotacao.totalAprovado ?? cotacao.totalEstimado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                color={cotacao.status === 'APROVADA' ? 'success' : 'warning'} />
            )}>
              {steps[2]}
            </StepLabel>
            <StepContent>
              {!cotacao ? (
                <Button size="small" variant="outlined" onClick={handleGerarCotacao} disabled={!reserva}>
                  {ts('sup.gerarCotacao')}
                </Button>
              ) : (
                <Stack spacing={1}>
                  <Typography variant="caption" color="text.secondary">
                    {ts('sup.cotacao.itens', { count: cotacao.itens.length })} |{' '}
                    {ts('sup.cotacao.total')}: R$ {(cotacao.totalAprovado ?? cotacao.totalEstimado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="outlined" onClick={() => setCotacaoDialogOpen(true)}>
                      {ts('sup.cotacao.editar')}
                    </Button>
                    {cotacao.status !== 'APROVADA' && (
                      <Button size="small" variant="contained" color="success" onClick={handleAprovarCotacao}
                        disabled={!cotacao.itens.every((i) => i.fornecedorSelecionado)}>
                        {ts('sup.cotacao.aprovar')}
                      </Button>
                    )}
                    {cotacao.status === 'APROVADA' && (
                      <Button size="small" variant="contained" onClick={() => setPedidoDialogOpen(true)}>
                        {ts('sup.gerarPedido')} →
                      </Button>
                    )}
                  </Stack>
                </Stack>
              )}
            </StepContent>
          </Step>

          {/* Step 3 — Pedido */}
          <Step completed={step > 3}>
            <StepLabel optional={pedido && (
              <Chip size="small" label={`${pedido.numero} · R$ ${pedido.totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                color={pedido.status === 'CONFIRMADO' ? 'success' : 'info'} />
            )}>
              {steps[3]}
            </StepLabel>
            <StepContent>
              {pedido && (
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                    {pedido.itens.map((item) => (
                      <Chip key={item.codigo} size="small"
                        label={`${item.descricao.substring(0, 25)} · ${item.fornecedor} · ${item.prazoEntrega}d`}
                        variant="outlined" />
                    ))}
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title={ts('sup.pedido.imprimirPdf')}>
                      <Button size="small" variant="outlined" startIcon={<PictureAsPdfIcon />}
                        onClick={() => PedidoService.imprimirPDF(pedido)}>
                        PDF
                      </Button>
                    </Tooltip>
                    {pedido.status === 'RASCUNHO' && (
                      <Button size="small" variant="contained" startIcon={<LocalShippingIcon />}
                        onClick={handleEnviarPedido}>
                        {ts('sup.pedido.enviar')}
                      </Button>
                    )}
                  </Stack>
                </Stack>
              )}
              {!pedido && cotacao?.status === 'APROVADA' && (
                <Button size="small" variant="contained" onClick={() => setPedidoDialogOpen(true)}>
                  {ts('sup.gerarPedido')}
                </Button>
              )}
            </StepContent>
          </Step>

          {/* Step 4 — Obra */}
          <Step completed={step > 4}>
            <StepLabel>{steps[4]}</StepLabel>
            <StepContent>
              {pedido?.status === 'ENVIADO' || pedido?.status === 'CONFIRMADO' ? (
                <Alert severity="success">
                  <Typography variant="caption">
                    {ts('sup.obra.materialLiberado', { numero: pedido?.numero ?? '' })}
                  </Typography>
                </Alert>
              ) : (
                <Typography variant="caption" color="text.secondary">{ts('sup.obra.aguardando')}</Typography>
              )}
            </StepContent>
          </Step>
        </Stepper>
      )}

      {/* ── Cotação Dialog ────────────────────────────────────────────── */}
      <Dialog open={cotacaoDialogOpen} onClose={() => setCotacaoDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>
          {ts('sup.cotacao.titulo')} — {cotacao?.numero}
          <Chip label={`R$ ${(cotacao?.totalEstimado ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            size="small" color="primary" sx={{ ml: 1 }} />
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {cotacao?.itens.map((item, idx) => (
              <Paper key={item.codigo} variant="outlined" sx={{ p: 1.5 }}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.codigo} — {item.descricao}
                  </Typography>
                  <Chip label={`${item.quantidade} ${item.unidade}`} size="small" />
                </Stack>

                {/* Fornecedores */}
                <Stack spacing={0.5} sx={{ mb: 1 }}>
                  {item.fornecedores.map((f) => (
                    <Stack key={f.fornecedor} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Chip size="small" label={f.fornecedor} variant={item.fornecedorSelecionado === f.fornecedor ? 'filled' : 'outlined'}
                        color={item.fornecedorSelecionado === f.fornecedor ? 'success' : 'default'}
                        onClick={() => handleSelecionarFornecedor(idx, f.fornecedor)} />
                      <Typography variant="caption">
                        R$ {f.precoUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} · {f.prazoEntrega}d
                        · Total: R$ {(f.precoUnitario * item.quantidade).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>

                <Divider sx={{ mb: 1 }} />
                <FornecedorForm onAdd={(f) => handleAddFornecedor(idx, f)} />
              </Paper>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCotacaoDialogOpen(false)}>{ts('actions.close')}</Button>
          <Button variant="contained" color="success"
            disabled={!cotacao?.itens.every((i) => i.fornecedorSelecionado)}
            onClick={handleAprovarCotacao}>
            {ts('sup.cotacao.aprovar')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Pedido Dialog ─────────────────────────────────────────────── */}
      <Dialog open={pedidoDialogOpen} onClose={() => setPedidoDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{ts('sup.pedido.titulo')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField fullWidth size="small" label={ts('sup.pedido.condicoes')} value={pedidoForm.condicoesPagamento}
              onChange={(e) => setPedidoForm({ ...pedidoForm, condicoesPagamento: e.target.value })} />
            <TextField fullWidth size="small" label={ts('sup.pedido.enderecoEntrega')} value={pedidoForm.enderecoEntrega}
              onChange={(e) => setPedidoForm({ ...pedidoForm, enderecoEntrega: e.target.value })} />
            <TextField fullWidth size="small" multiline rows={2} label={ts('sup.pedido.observacoes')} value={pedidoForm.observacoes}
              onChange={(e) => setPedidoForm({ ...pedidoForm, observacoes: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPedidoDialogOpen(false)}>{ts('actions.cancel')}</Button>
          <Button variant="contained" onClick={handleGerarPedido}>{ts('sup.pedido.gerar')}</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
