/**
 * Assistente inteligente de seleção de bombas com curva de rendimento
 */

import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import WarningIcon from '@mui/icons-material/Warning'
import { PumpAssistant } from '../engine/HydraulicCalculations'
import type { PumpSelectionResult } from '../types/hydraulicTypes'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

interface PumpCurveDisplayProps {
  curva: Array<{ vazao: number; altura: number; rendimento: number; potencia: number }>
  pontoOperacao: { vazao: number; altura: number }
}

const PumpCurveDisplay = ({ curva, pontoOperacao }: PumpCurveDisplayProps) => {
  const maxAltura = Math.max(...curva.map((p) => p.altura))
  const maxVazao = Math.max(...curva.map((p) => p.vazao))

  return (
    <Box sx={{ position: 'relative', width: '100%', height: 160, border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1, bgcolor: 'grey.50' }}>
      <svg width="100%" height="100%" viewBox="0 0 200 120">
        {/* Eixos */}
        <line x1="20" y1="10" x2="20" y2="100" stroke="#999" strokeWidth="1" />
        <line x1="20" y1="100" x2="195" y2="100" stroke="#999" strokeWidth="1" />
        <text x="10" y="8" fontSize="7" fill="#666">H(m)</text>
        <text x="185" y="108" fontSize="7" fill="#666">Q(m³/h)</text>

        {/* Curva H-Q */}
        <polyline
          fill="none"
          stroke="#1976d2"
          strokeWidth="2"
          points={curva.map((p) => {
            const x = 20 + (p.vazao / maxVazao) * 170
            const y = 100 - (p.altura / maxAltura) * 85
            return `${x},${y}`
          }).join(' ')}
        />

        {/* Curva rendimento */}
        <polyline
          fill="none"
          stroke="#4caf50"
          strokeWidth="1.5"
          strokeDasharray="4,2"
          points={curva.map((p) => {
            const x = 20 + (p.vazao / maxVazao) * 170
            const y = 100 - (p.rendimento / 100) * 85
            return `${x},${y}`
          }).join(' ')}
        />

        {/* Ponto de operação */}
        <circle
          cx={20 + (pontoOperacao.vazao / maxVazao) * 170}
          cy={100 - (pontoOperacao.altura / maxAltura) * 85}
          r="4"
          fill="#ff5722"
          stroke="white"
          strokeWidth="1"
        />

        {/* Legenda */}
        <line x1="22" y1="112" x2="40" y2="112" stroke="#1976d2" strokeWidth="2" />
        <text x="42" y="115" fontSize="6" fill="#1976d2">H-Q</text>
        <line x1="75" y1="112" x2="93" y2="112" stroke="#4caf50" strokeWidth="1.5" strokeDasharray="4,2" />
        <text x="95" y="115" fontSize="6" fill="#4caf50">η%</text>
        <circle cx="130" cy="112" r="3" fill="#ff5722" />
        <text x="136" y="115" fontSize="6" fill="#ff5722">Ponto op.</text>
      </svg>
    </Box>
  )
}

export const PumpAssistantPanel = () => {
  const ts = useTranslationService()
  const [vazao, setVazao] = useState(30)
  const [altura, setAltura] = useState(35)
  const [results, setResults] = useState<PumpSelectionResult[]>([])
  const [selected, setSelected] = useState<PumpSelectionResult | null>(null)

  const selecionar = () => {
    const r = PumpAssistant.select(vazao, altura, 3)
    setResults(r)
    setSelected(r[0] ?? null)
  }

  return (
    <Stack spacing={2}>
      {/* Inputs */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 1.5 }}>{ts('hydraulic.assistant.pontoOperacao')}</Typography>
        <Grid container spacing={2} sx={{ alignItems: 'flex-end' }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label={ts('hydraulic.calc.vazao')}
              type="number"
              size="small"
              fullWidth
              value={vazao}
              onChange={(e) => setVazao(Number(e.target.value))}
              slotProps={{ input: { endAdornment: <Typography variant="caption">m³/h</Typography> } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label={ts('hydraulic.calc.alturaManometrica')}
              type="number"
              size="small"
              fullWidth
              value={altura}
              onChange={(e) => setAltura(Number(e.target.value))}
              slotProps={{ input: { endAdornment: <Typography variant="caption">m.c.a.</Typography> } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Button variant="contained" fullWidth onClick={selecionar}>
              {ts('hydraulic.assistant.selecionar')}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Results */}
      {results.length > 0 && (
        <Grid container spacing={2}>
          {/* List */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2">{ts('hydraulic.assistant.bombas')}</Typography>
              {results.map((r) => (
                <Paper
                  key={r.bomba.id}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    cursor: 'pointer',
                    border: selected?.bomba.id === r.bomba.id ? '2px solid' : '1px solid',
                    borderColor: selected?.bomba.id === r.bomba.id ? 'primary.main' : 'divider',
                  }}
                  onClick={() => setSelected(r)}
                >
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>{r.bomba.modelo}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>{r.bomba.fabricante}</Typography>
                    </Box>
                    <Chip
                      label={`Score ${r.score}`}
                      size="small"
                      color={r.score > 70 ? 'success' : r.score > 50 ? 'warning' : 'error'}
                    />
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                    <Typography variant="caption">{r.pontoOperacao.altura.toFixed(1)}m.c.a.</Typography>
                    <Typography variant="caption">{r.pontoOperacao.rendimento.toFixed(0)}%</Typography>
                    <Typography variant="caption">{r.pontoOperacao.potencia.toFixed(1)}kW</Typography>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Grid>

          {/* Detail */}
          {selected && (
            <Grid size={{ xs: 12, md: 8 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="h6">{selected.bomba.modelo}</Typography>
                  <Chip
                    icon={<CheckCircleIcon />}
                    label={`${ts('hydraulic.assistant.margem')}: ${selected.margem}%`}
                    color="success"
                    size="small"
                  />
                </Stack>

                {/* Curve */}
                <PumpCurveDisplay curva={selected.bomba.curva} pontoOperacao={selected.pontoOperacao} />

                <Divider sx={{ my: 1.5 }} />

                <Grid container spacing={1} sx={{ mb: 1 }}>
                  {[
                    [ts('hydraulic.assistant.vazaoPonto'), `${selected.pontoOperacao.vazao} m³/h`],
                    [ts('hydraulic.assistant.alturaPonto'), `${selected.pontoOperacao.altura.toFixed(1)} m.c.a.`],
                    [ts('hydraulic.assistant.rendimento'), `${selected.pontoOperacao.rendimento.toFixed(0)}%`],
                    [ts('hydraulic.assistant.potencia'), `${selected.pontoOperacao.potencia.toFixed(1)} kW`],
                    [ts('hydraulic.assistant.npsh'), `${selected.pontoOperacao.npsh.toFixed(1)} m`],
                    [ts('hydraulic.assistant.motor'), selected.motorIndicado],
                    [ts('hydraulic.assistant.tubulacao'), selected.tubulacaoRecomendada],
                    [ts('hydraulic.calc.potMotor'), `${selected.bomba.potenciaNominal} kW`],
                  ].map(([label, value]) => (
                    <Grid key={label} size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary">{label}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{value}</Typography>
                    </Grid>
                  ))}
                </Grid>

                {selected.advertencias.length > 0 && (
                  <Stack spacing={0.5}>
                    {selected.advertencias.map((adv) => (
                      <Alert key={adv} severity="warning" icon={<WarningIcon />} sx={{ py: 0 }}>
                        <Typography variant="caption">{ts(adv)}</Typography>
                      </Alert>
                    ))}
                  </Stack>
                )}
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      {results.length === 0 && (
        <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">{ts('hydraulic.assistant.instrucao')}</Typography>
        </Paper>
      )}

      {results.length === 0 && vazao > 0 && altura > 0 && (
        <Alert severity="info">{ts('hydraulic.assistant.instrucao')}</Alert>
      )}
    </Stack>
  )
}

