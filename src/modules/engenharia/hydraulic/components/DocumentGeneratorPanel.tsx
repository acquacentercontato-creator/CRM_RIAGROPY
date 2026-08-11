/**
 * Painel de geração de documentos: Memorial → Materiais → PDF → ART → Proposta
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
  Step,
  StepContent,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material'
import ArticleIcon from '@mui/icons-material/Article'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DownloadIcon from '@mui/icons-material/Download'
import ListAltIcon from '@mui/icons-material/ListAlt'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import { HydraulicCalculations } from '../engine/HydraulicCalculations'
import {
  MaterialListService,
  MemorialService,
  PrintService,
  type MaterialList,
  type MemorialDescritivo,
  type MemorialInput,
} from '../engine/DocumentServices'
import type { HydraulicSystemParams } from '../types/hydraulicTypes'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

const CULTURAS = ['Soja', 'Milho', 'Trigo', 'Feijão', 'Tomate', 'Alface', 'Café', 'Cana-de-açúcar', 'Pastagem', 'Outro']
const SISTEMAS = ['ASPERSAO', 'GOTEJAMENTO', 'PIVO', 'CARRETEL', 'MICROASPERSAO']

const defaultParams: HydraulicSystemParams = {
  vazao: 30,
  alturaGeometrica: 20,
  comprimentoTubulacao: 500,
  diametroTubulacao: 75,
  materialTubulacao: 'PVC',
  reservaTecnica: 15,
}

interface ProjectForm {
  nomeProjeto: string
  nomeCliente: string
  nomeResponsavel: string
  crea: string
  municipio: string
  estado: string
  areaIrrigada: string
  culturaIrrigada: string
  sistemaIrrigacao: string
  fonteDagua: string
}

const initialForm: ProjectForm = {
  nomeProjeto: '',
  nomeCliente: '',
  nomeResponsavel: '',
  crea: '',
  municipio: '',
  estado: '',
  areaIrrigada: '10',
  culturaIrrigada: 'Soja',
  sistemaIrrigacao: 'ASPERSAO',
  fonteDagua: 'Poço tubular profundo',
}

export const DocumentGeneratorPanel = () => {
  const ts = useTranslationService()
  const [activeStep, setActiveStep] = useState(0)
  const [form, setForm] = useState<ProjectForm>(initialForm)
  const [params, setParams] = useState<HydraulicSystemParams>(defaultParams)
  const [memorial, setMemorial] = useState<MemorialDescritivo | null>(null)
  const [materialList, setMaterialList] = useState<MaterialList | null>(null)
  const [generating, setGenerating] = useState(false)

  const setField = (field: keyof ProjectForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value })

  const buildInput = (): MemorialInput => ({
    ...form,
    areaIrrigada: parseFloat(form.areaIrrigada) || 10,
    params,
    resultado: HydraulicCalculations.calcular(params),
  })

  const handleGerarMemorial = async () => {
    setGenerating(true)
    await new Promise((r) => setTimeout(r, 600)) // simulate AI processing
    const input = buildInput()
    setMemorial(MemorialService.gerar(input))
    setMaterialList(MaterialListService.gerar(input))
    setGenerating(false)
    setActiveStep(1)
  }

  const handleImprimirMemorial = () => {
    if (!memorial) return
    const html = PrintService.memorialToHtml(memorial)
    PrintService.imprimirHtml(html, memorial.titulo)
  }

  const handleImprimirMateriais = () => {
    if (!materialList) return
    const html = PrintService.materialListToHtml(materialList, form.nomeProjeto, form.nomeCliente)
    PrintService.imprimirHtml(html, 'Lista de Materiais')
  }

  const steps = [
    ts('doc.steps.projeto'),
    ts('doc.steps.memorial'),
    ts('doc.steps.materiais'),
    ts('doc.steps.pdf'),
  ]

  return (
    <Stack spacing={2}>
      <Alert severity="info" icon={<ArticleIcon />}>
        {ts('doc.info')}
      </Alert>

      <Stepper activeStep={activeStep} orientation="vertical">
        {/* Step 0 — Dados do Projeto */}
        <Step>
          <StepLabel>{steps[0]}</StepLabel>
          <StepContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth size="small" label={ts('doc.form.nomeProjeto')} value={form.nomeProjeto} onChange={setField('nomeProjeto')} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth size="small" label={ts('doc.form.nomeCliente')} value={form.nomeCliente} onChange={setField('nomeCliente')} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth size="small" label={ts('doc.form.nomeResponsavel')} value={form.nomeResponsavel} onChange={setField('nomeResponsavel')} />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField fullWidth size="small" label={ts('doc.form.crea')} value={form.crea} onChange={setField('crea')} />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField fullWidth size="small" label={ts('doc.form.area')} type="number" value={form.areaIrrigada} onChange={setField('areaIrrigada')}
                  slotProps={{ input: { endAdornment: <Typography variant="caption">ha</Typography> } }} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth size="small" label={ts('doc.form.municipio')} value={form.municipio} onChange={setField('municipio')} />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <TextField fullWidth size="small" label={ts('doc.form.estado')} value={form.estado} onChange={setField('estado')} />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField select fullWidth size="small" label={ts('doc.form.cultura')} value={form.culturaIrrigada} onChange={setField('culturaIrrigada')}
                  slotProps={{ select: { native: true } }}>
                  {CULTURAS.map((c) => <option key={c} value={c}>{c}</option>)}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField select fullWidth size="small" label={ts('doc.form.sistema')} value={form.sistemaIrrigacao} onChange={setField('sistemaIrrigacao')}
                  slotProps={{ select: { native: true } }}>
                  {SISTEMAS.map((s) => <option key={s} value={s}>{ts(`doc.sistema.${s}`)}</option>)}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 0.5 }}><Typography variant="caption">{ts('doc.form.parametrosCalculo')}</Typography></Divider>
              </Grid>
              {[
                { label: ts('hydraulic.calc.vazao'), key: 'vazao' as const, unit: 'm³/h' },
                { label: ts('hydraulic.calc.alturaGeom'), key: 'alturaGeometrica' as const, unit: 'm' },
                { label: ts('hydraulic.calc.comprimento'), key: 'comprimentoTubulacao' as const, unit: 'm' },
                { label: ts('hydraulic.calc.diametro'), key: 'diametroTubulacao' as const, unit: 'mm' },
              ].map(({ label, key, unit }) => (
                <Grid key={key} size={{ xs: 6, md: 3 }}>
                  <TextField fullWidth size="small" label={label} type="number" value={params[key]}
                    onChange={(e) => setParams({ ...params, [key]: Number(e.target.value) })}
                    slotProps={{ input: { endAdornment: <Typography variant="caption">{unit}</Typography> } }} />
                </Grid>
              ))}
            </Grid>

            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                onClick={handleGerarMemorial}
                disabled={!form.nomeProjeto || !form.nomeCliente || !form.nomeResponsavel || generating}
              >
                {generating ? ts('doc.gerando') : ts('doc.gerarMemorial')}
              </Button>
            </Box>
          </StepContent>
        </Step>

        {/* Step 1 — Memorial */}
        <Step>
          <StepLabel
            optional={memorial && <Chip icon={<CheckCircleIcon />} label={ts('doc.gerado')} size="small" color="success" />}
          >
            {steps[1]}
          </StepLabel>
          <StepContent>
            {memorial && (
              <Stack spacing={1.5}>
                <Paper variant="outlined" sx={{ p: 2, maxHeight: 400, overflow: 'auto', bgcolor: 'grey.50' }}>
                  <Typography variant="h6" align="center" sx={{ mb: 2 }}>{memorial.titulo}</Typography>
                  {memorial.secoes.map((s) => (
                    <Box key={s.titulo} sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="primary" sx={{ mb: 0.5 }}>{s.titulo}</Typography>
                      <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '11px' }}>
                        {s.conteudo}
                      </Typography>
                    </Box>
                  ))}
                </Paper>
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" startIcon={<PictureAsPdfIcon />} onClick={handleImprimirMemorial}>
                    {ts('doc.imprimirPdf')}
                  </Button>
                  <Button variant="outlined" onClick={() => setActiveStep(2)}>
                    {ts('doc.steps.materiais')} →
                  </Button>
                </Stack>
              </Stack>
            )}
          </StepContent>
        </Step>

        {/* Step 2 — Lista de Materiais */}
        <Step>
          <StepLabel
            optional={materialList && <Chip icon={<CheckCircleIcon />} label={ts('doc.gerado')} size="small" color="success" />}
          >
            {steps[2]}
          </StepLabel>
          <StepContent>
            {materialList && (
              <Stack spacing={1.5}>
                <Paper variant="outlined" sx={{ p: 1.5 }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2">{ts('doc.materiais.titulo')}</Typography>
                    <Chip
                      label={`Total: R$ ${materialList.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                      color="primary"
                      size="small"
                    />
                  </Stack>

                  <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                    {materialList.itens.map((item) => (
                      <Stack key={item.id} direction="row" sx={{ justifyContent: 'space-between', py: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Stack>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>{item.descricao}</Typography>
                          <Typography variant="caption" color="text.secondary">{item.categoria} · {item.fabricante ?? ''}</Typography>
                        </Stack>
                        <Stack sx={{ alignItems: 'flex-end', flexShrink: 0, ml: 1 }}>
                          <Typography variant="caption">{item.quantidade} {item.unidade}</Typography>
                          <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                            R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </Typography>
                        </Stack>
                      </Stack>
                    ))}
                  </Box>

                  <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', mt: 1, pt: 1, borderTop: '2px solid', borderColor: 'primary.main' }}>
                    <Typography variant="body2">Subtotal: <strong>R$ {materialList.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></Typography>
                    <Typography variant="body2">Reserva: <strong>R$ {materialList.reservaTecnica.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></Typography>
                    <Typography variant="body2" color="primary" sx={{ fontWeight: 700 }}>
                      Total: R$ {materialList.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Stack>
                </Paper>

                <Stack direction="row" spacing={1}>
                  <Button variant="contained" startIcon={<PictureAsPdfIcon />} onClick={handleImprimirMateriais}>
                    {ts('doc.imprimirPdf')}
                  </Button>
                  <Button variant="outlined" startIcon={<ListAltIcon />} onClick={() => setActiveStep(3)}>
                    {ts('doc.steps.pdf')} →
                  </Button>
                </Stack>
              </Stack>
            )}
          </StepContent>
        </Step>

        {/* Step 3 — PDF Final */}
        <Step>
          <StepLabel>{steps[3]}</StepLabel>
          <StepContent>
            <Stack spacing={1.5}>
              <Typography variant="body2" color="text.secondary">{ts('doc.pdf.instrucao')}</Typography>
              <Grid container spacing={1}>
                {[
                  { label: ts('doc.pdf.memorial'), icon: <ArticleIcon />, action: handleImprimirMemorial, disabled: !memorial },
                  { label: ts('doc.pdf.materiais'), icon: <ListAltIcon />, action: handleImprimirMateriais, disabled: !materialList },
                  {
                    label: ts('doc.pdf.completo'),
                    icon: <DownloadIcon />,
                    disabled: !memorial || !materialList,
                    action: () => {
                      if (!memorial || !materialList) return
                      const html = PrintService.memorialToHtml(memorial) + '<div style="page-break-before:always"></div>' +
                        PrintService.materialListToHtml(materialList, form.nomeProjeto, form.nomeCliente)
                      PrintService.imprimirHtml(html, 'Projeto Completo — ' + form.nomeProjeto)
                    },
                  },
                ].map(({ label, icon, action, disabled }) => (
                  <Grid key={label} size={{ xs: 12, sm: 4 }}>
                    <Button variant="outlined" startIcon={icon} fullWidth onClick={action} disabled={disabled}>
                      {label}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </StepContent>
        </Step>
      </Stepper>
    </Stack>
  )
}
