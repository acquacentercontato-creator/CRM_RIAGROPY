/**
 * Calculadora hidráulica interativa
 */

import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import CalculateIcon from '@mui/icons-material/Calculate'
import WarningIcon from '@mui/icons-material/Warning'
import { HydraulicCalculations } from '../engine/HydraulicCalculations'
import type { HydraulicCalculationResult, HydraulicSystemParams } from '../types/hydraulicTypes'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

const defaultParams: HydraulicSystemParams = {
  vazao: 30,
  alturaGeometrica: 20,
  comprimentoTubulacao: 500,
  diametroTubulacao: 75,
  materialTubulacao: 'PVC',
  reservaTecnica: 15,
}

const ResultRow = ({ label, value, unit, highlight }: { label: string; value: string | number; unit?: string; highlight?: boolean }) => (
  <Stack direction="row" sx={{ justifyContent: 'space-between', py: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>
    <Typography variant="caption" color="text.secondary">{label}</Typography>
    <Typography variant="caption" sx={{ fontWeight: highlight ? 700 : 400, color: highlight ? 'primary.main' : 'text.primary' }}>
      {value} {unit}
    </Typography>
  </Stack>
)

export const HydraulicCalculatorPanel = () => {
  const ts = useTranslationService()
  const [params, setParams] = useState<HydraulicSystemParams>(defaultParams)
  const [result, setResult] = useState<HydraulicCalculationResult | null>(null)

  const calcular = () => {
    setResult(HydraulicCalculations.calcular(params))
  }

  const regimeCor = (regime?: string) => {
    if (regime === 'LAMINAR') return 'success'
    if (regime === 'TRANSICAO') return 'warning'
    return 'error'
  }

  return (
    <Grid container spacing={2}>
      {/* Inputs */}
      <Grid size={{ xs: 12, md: 5 }}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>{ts('hydraulic.calc.parametros')}</Typography>
          <Stack spacing={1.5}>
            <TextField
              label={ts('hydraulic.calc.vazao')}
              type="number"
              size="small"
              value={params.vazao}
              onChange={(e) => setParams({ ...params, vazao: Number(e.target.value) })}
              slotProps={{ input: { endAdornment: <Typography variant="caption">m³/h</Typography> } }}
            />
            <TextField
              label={ts('hydraulic.calc.alturaGeom')}
              type="number"
              size="small"
              value={params.alturaGeometrica}
              onChange={(e) => setParams({ ...params, alturaGeometrica: Number(e.target.value) })}
              slotProps={{ input: { endAdornment: <Typography variant="caption">m</Typography> } }}
            />
            <TextField
              label={ts('hydraulic.calc.comprimento')}
              type="number"
              size="small"
              value={params.comprimentoTubulacao}
              onChange={(e) => setParams({ ...params, comprimentoTubulacao: Number(e.target.value) })}
              slotProps={{ input: { endAdornment: <Typography variant="caption">m</Typography> } }}
            />
            <TextField
              label={ts('hydraulic.calc.diametro')}
              type="number"
              size="small"
              value={params.diametroTubulacao}
              onChange={(e) => setParams({ ...params, diametroTubulacao: Number(e.target.value) })}
              slotProps={{ input: { endAdornment: <Typography variant="caption">mm (DN)</Typography> } }}
            />
            <TextField
              select
              label={ts('hydraulic.calc.material')}
              size="small"
              value={params.materialTubulacao}
              onChange={(e) => setParams({ ...params, materialTubulacao: e.target.value as HydraulicSystemParams['materialTubulacao'] })}
            >
              {(['PVC', 'PEAD', 'FERRO_GALVANIZADO', 'FERRO_FUNDIDO', 'ACO'] as const).map((m) => (
                <MenuItem key={m} value={m}>{ts(`hydraulic.material.${m}`)}</MenuItem>
              ))}
            </TextField>
            <TextField
              label={ts('hydraulic.calc.reserva')}
              type="number"
              size="small"
              value={params.reservaTecnica}
              onChange={(e) => setParams({ ...params, reservaTecnica: Number(e.target.value) })}
              slotProps={{ input: { endAdornment: <Typography variant="caption">%</Typography> } }}
            />
            <Button variant="contained" startIcon={<CalculateIcon />} onClick={calcular} fullWidth>
              {ts('hydraulic.calc.calcular')}
            </Button>
          </Stack>
        </Paper>
      </Grid>

      {/* Results */}
      <Grid size={{ xs: 12, md: 7 }}>
        {result ? (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="h6">{ts('hydraulic.calc.resultados')}</Typography>
              <Chip
                label={ts(`hydraulic.regime.${result.regimeEscoamento}`)}
                size="small"
                color={regimeCor(result.regimeEscoamento)}
              />
            </Stack>

            <Typography variant="subtitle2" color="primary" sx={{ mt: 1 }}>{ts('hydraulic.calc.escoamento')}</Typography>
            <ResultRow label={ts('hydraulic.calc.velocidade')} value={result.velocidade} unit="m/s" />
            <ResultRow label={ts('hydraulic.calc.reynolds')} value={result.numeroReynolds.toLocaleString()} />
            <ResultRow label={ts('hydraulic.calc.hwCoef')} value={result.coeficienteHW} />

            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" color="primary">{ts('hydraulic.calc.perdaCarga')}</Typography>
            <ResultRow label={ts('hydraulic.calc.pcUnitaria')} value={result.perdaCargaUnitaria} unit="m/100m" />
            <ResultRow label={ts('hydraulic.calc.pcDistribuida')} value={result.perdaCargaTotal - result.perdaCargaAcessorios} unit="m" />
            <ResultRow label={ts('hydraulic.calc.pcAcessorios')} value={result.perdaCargaAcessorios} unit="m" />
            <ResultRow label={ts('hydraulic.calc.pcReserva')} value={result.perdaCargaReserva} unit={`m (+${params.reservaTecnica}%)`} />
            <ResultRow label={ts('hydraulic.calc.pcTotal')} value={result.perdaCargaSistema} unit="m" highlight />

            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" color="primary">{ts('hydraulic.calc.bomba')}</Typography>
            <ResultRow label={ts('hydraulic.calc.alturaManometrica')} value={result.alturaManometricaTotal} unit="m.c.a." highlight />
            <ResultRow label={ts('hydraulic.calc.potHidraulica')} value={result.potenciaHidraulica} unit="kW" />
            <ResultRow label={ts('hydraulic.calc.potAbsorvida')} value={result.potenciaAbsorvida} unit="kW" />
            <ResultRow label={ts('hydraulic.calc.potMotor')} value={result.potenciaMotor} unit="kW" highlight />

            {result.advertencias.length > 0 && (
              <Box sx={{ mt: 1.5 }}>
                {result.advertencias.map((adv) => (
                  <Alert key={adv} severity="warning" icon={<WarningIcon />} sx={{ mb: 0.5, py: 0 }}>
                    <Typography variant="caption">{ts(adv)}</Typography>
                  </Alert>
                ))}
              </Box>
            )}
          </Paper>
        ) : (
          <Paper variant="outlined" sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
            <Typography color="text.secondary">{ts('hydraulic.calc.aguardando')}</Typography>
          </Paper>
        )}
      </Grid>
    </Grid>
  )
}
