/**
 * Proposta comercial e ART — etapa final do fluxo documental
 */

import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Divider,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import AssignmentIcon from '@mui/icons-material/Assignment'
import BusinessIcon from '@mui/icons-material/Business'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import { PrintService } from '../engine/DocumentServices'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

// ── ART Form ───────────────────────────────────────────────────────────────

interface ARTData {
  nomeResponsavel: string
  crea: string
  cpf: string
  telefone: string
  email: string
  nomeCliente: string
  cpfCnpjCliente: string
  enderecoObra: string
  municipioObra: string
  ufObra: string
  descricaoAtividade: string
  dataInicio: string
  dataConclsuao: string
  valorContrato: string
}

const ARTPanel = () => {
  const ts = useTranslationService()
  const [art, setART] = useState<ARTData>({
    nomeResponsavel: '', crea: '', cpf: '', telefone: '', email: '',
    nomeCliente: '', cpfCnpjCliente: '', enderecoObra: '',
    municipioObra: '', ufObra: '', descricaoAtividade: '',
    dataInicio: '', dataConclsuao: '', valorContrato: '',
  })

  const setField = (key: keyof ARTData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setART({ ...art, [key]: e.target.value })

  const handleImprimirART = () => {
    const html = `
<div class="cover">
  <div class="empresa">${ts('doc.art.print.title')}</div>
  <div class="doc-tipo">${ts('doc.art.print.subtitle')}</div>
</div>
<div style="page-break-before:always"></div>
<h1>${ts('doc.art.print.title')}</h1>
<p style="text-align:center;color:#666;font-size:9pt">${ts('doc.art.print.legal')}</p>

<h2>${ts('doc.art.print.responsibleSection')}</h2>
<pre>
${ts('doc.art.print.name')}: ${art.nomeResponsavel}
${ts('doc.common.cpf')}: ${art.cpf}
CREA: ${art.crea}
${ts('doc.common.phone')}: ${art.telefone}
${ts('doc.common.email')}: ${art.email}
</pre>

<h2>${ts('doc.art.print.contractorSection')}</h2>
<pre>
${ts('doc.art.print.businessName')}: ${art.nomeCliente}
${ts('doc.common.cpfCnpj')}: ${art.cpfCnpjCliente}
${ts('doc.art.enderecoObra')}: ${art.enderecoObra}
${ts('doc.art.print.cityState')}: ${art.municipioObra} / ${art.ufObra}
</pre>

<h2>${ts('doc.art.print.activitySection')}</h2>
<pre>${art.descricaoAtividade || ts('doc.art.print.defaultActivity')}</pre>

<h2>${ts('doc.art.print.scheduleSection')}</h2>
<pre>
${ts('doc.art.dataInicio')}: ${art.dataInicio}
${ts('doc.art.dataConclusao')}: ${art.dataConclsuao}
${ts('doc.art.valorContrato')}: R$ ${art.valorContrato}
</pre>

<h2>${ts('doc.art.print.declarationSection')}</h2>
<p>${ts('doc.art.print.declaration')}</p>

<p style="margin-top:20mm;text-align:center">
____________________________________<br/>
${art.nomeResponsavel}<br/>
CREA ${art.crea}<br/><br/>
${new Date().toLocaleDateString(ts('crm.currency.locale'))}
</p>`

    PrintService.imprimirHtml(html, ts('doc.art.print.fileTitle', { name: art.nomeResponsavel }))
  }

  return (
    <Stack spacing={2}>
      <Alert severity="info">
        {ts('doc.art.info')}
      </Alert>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" color="primary">{ts('doc.art.dadosResponsavel')}</Typography>
        </Grid>
        {[
          { label: ts('doc.form.nomeResponsavel'), key: 'nomeResponsavel' as const },
          { label: ts('doc.form.crea'), key: 'crea' as const },
          { label: ts('doc.common.cpf'), key: 'cpf' as const },
          { label: ts('doc.common.phone'), key: 'telefone' as const },
          { label: ts('doc.common.email'), key: 'email' as const },
        ].map(({ label, key }) => (
          <Grid key={key} size={{ xs: 12, md: 4 }}>
            <TextField fullWidth size="small" label={label} value={art[key]} onChange={setField(key)} />
          </Grid>
        ))}

        <Grid size={{ xs: 12 }}>
          <Divider><Typography variant="caption">{ts('doc.art.dadosCliente')}</Typography></Divider>
        </Grid>
        {[
          { label: ts('doc.form.nomeCliente'), key: 'nomeCliente' as const, size: 6 },
          { label: ts('doc.common.cpfCnpj'), key: 'cpfCnpjCliente' as const, size: 3 },
          { label: ts('doc.form.municipio'), key: 'municipioObra' as const, size: 2 },
          { label: ts('doc.form.estado'), key: 'ufObra' as const, size: 1 },
          { label: ts('doc.art.enderecoObra'), key: 'enderecoObra' as const, size: 12 },
        ].map(({ label, key, size }) => (
          <Grid key={key} size={{ xs: 12, md: size as 1 | 2 | 3 | 6 | 12 }}>
            <TextField fullWidth size="small" label={label} value={art[key]} onChange={setField(key)} />
          </Grid>
        ))}

        <Grid size={{ xs: 12 }}>
          <TextField fullWidth size="small" multiline rows={3} label={ts('doc.art.atividade')}
            value={art.descricaoAtividade} onChange={setField('descricaoAtividade')}
            placeholder={ts('doc.art.activityPlaceholder')} />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <TextField fullWidth size="small" type="date" label={ts('doc.art.dataInicio')} value={art.dataInicio}
            onChange={setField('dataInicio')} slotProps={{ inputLabel: { shrink: true } }} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField fullWidth size="small" type="date" label={ts('doc.art.dataConclusao')} value={art.dataConclsuao}
            onChange={setField('dataConclsuao')} slotProps={{ inputLabel: { shrink: true } }} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField fullWidth size="small" label={ts('doc.art.valorContrato')} value={art.valorContrato}
            onChange={setField('valorContrato')}
            slotProps={{ input: { startAdornment: <Typography variant="caption" sx={{ mr: 0.5 }}>R$</Typography> } }} />
        </Grid>
      </Grid>

      <Button variant="contained" startIcon={<PictureAsPdfIcon />} onClick={handleImprimirART}
        disabled={!art.nomeResponsavel || !art.crea || !art.nomeCliente}>
        {ts('doc.art.gerar')}
      </Button>
    </Stack>
  )
}

// ── Proposta Comercial ─────────────────────────────────────────────────────

interface PropostaData {
  nomeProjeto: string
  nomeCliente: string
  nomeEmpresa: string
  cnpjEmpresa: string
  telefoneEmpresa: string
  emailEmpresa: string
  enderecoEmpresa: string
  validadeProposta: string
  condicoesPagamento: string
  totalMateriais: string
  totalServicos: string
  totalProjeto: string
  prazoExecucao: string
  garantia: string
  observacoes: string
}

const PropostaPainel = () => {
  const ts = useTranslationService()
  const [proposta, setProposta] = useState<PropostaData>({
    nomeProjeto: '', nomeCliente: '',
    nomeEmpresa: 'RIAGRO', cnpjEmpresa: '',
    telefoneEmpresa: '', emailEmpresa: '',
    enderecoEmpresa: '', validadeProposta: '30',
    condicoesPagamento: ts('doc.proposta.defaults.payment'),
    totalMateriais: '', totalServicos: '',
    totalProjeto: '', prazoExecucao: '30',
    garantia: ts('doc.proposta.defaults.warranty'), observacoes: '',
  })

  const setField = (key: keyof PropostaData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setProposta({ ...proposta, [key]: e.target.value })

  const total = (parseFloat(proposta.totalMateriais) || 0) + (parseFloat(proposta.totalServicos) || 0) +
    (parseFloat(proposta.totalProjeto) || 0)

  const handleImprimir = () => {
    const html = `
<div class="cover">
  <div class="empresa">${proposta.nomeEmpresa}</div>
  <div class="doc-tipo">${ts('doc.proposta.print.title')}</div>
  <div class="projeto">${proposta.nomeProjeto}</div>
  <div class="info">
    ${ts('doc.proposta.print.client')}: ${proposta.nomeCliente}<br/>
    ${ts('doc.proposta.print.date')}: ${new Date().toLocaleDateString(ts('crm.currency.locale'))}<br/>
    ${ts('doc.proposta.print.validFor', { days: proposta.validadeProposta })}
  </div>
</div>
<div style="page-break-before:always"></div>
<h1>${ts('doc.proposta.print.title')}</h1>
<h2>${ts('doc.proposta.print.system')} — ${proposta.nomeProjeto}</h2>

<h2>${ts('doc.proposta.print.companySection')}</h2>
<pre>
${ts('doc.proposta.empresa')}: ${proposta.nomeEmpresa}
CNPJ: ${proposta.cnpjEmpresa}
${ts('doc.common.phone')}: ${proposta.telefoneEmpresa}
${ts('doc.common.email')}: ${proposta.emailEmpresa}
${ts('doc.proposta.print.address')}: ${proposta.enderecoEmpresa}
</pre>

<h2>${ts('doc.proposta.print.clientSection')}</h2>
<pre>${ts('doc.art.print.businessName')}: ${proposta.nomeCliente}</pre>

<h2>${ts('doc.proposta.print.pricingSection')}</h2>
<table>
  <thead><tr><th>${ts('doc.proposta.print.item')}</th><th>${ts('doc.proposta.print.description')}</th><th style="text-align:right">${ts('doc.proposta.print.value')}</th></tr></thead>
  <tbody>
    <tr><td>01</td><td>${ts('doc.proposta.print.materials')}</td><td style="text-align:right">R$ ${parseFloat(proposta.totalMateriais || '0').toLocaleString(ts('crm.currency.locale'), { minimumFractionDigits: 2 })}</td></tr>
    <tr><td>02</td><td>${ts('doc.proposta.print.services')}</td><td style="text-align:right">R$ ${parseFloat(proposta.totalServicos || '0').toLocaleString(ts('crm.currency.locale'), { minimumFractionDigits: 2 })}</td></tr>
    <tr><td>03</td><td>${ts('doc.proposta.print.projectDocs')}</td><td style="text-align:right">R$ ${parseFloat(proposta.totalProjeto || '0').toLocaleString(ts('crm.currency.locale'), { minimumFractionDigits: 2 })}</td></tr>
  </tbody>
  <tfoot>
    <tr class="total-row"><td colspan="2"><strong>${ts('doc.proposta.totalGeral')}</strong></td><td style="text-align:right"><strong>R$ ${total.toLocaleString(ts('crm.currency.locale'), { minimumFractionDigits: 2 })}</strong></td></tr>
  </tfoot>
</table>

<h2>${ts('doc.proposta.print.termsSection')}</h2>
<pre>
${ts('doc.proposta.condicoes')}: ${proposta.condicoesPagamento}
${ts('doc.proposta.print.executionDays', { days: proposta.prazoExecucao })}
${ts('doc.proposta.print.systemWarranty')}: ${proposta.garantia}
${ts('doc.proposta.print.proposalValidity', { days: proposta.validadeProposta })}
</pre>

${proposta.observacoes ? `<h2>${ts('doc.proposta.print.notesSection')}</h2><pre>${proposta.observacoes}</pre>` : ''}

<p style="margin-top:15mm;text-align:center">
${ts('doc.proposta.print.validUntil')}: ${new Date(Date.now() + parseInt(proposta.validadeProposta) * 86400000).toLocaleDateString(ts('crm.currency.locale'))}<br/><br/>
____________________________________<br/>
${proposta.nomeEmpresa}<br/>
${proposta.emailEmpresa}
</p>`

    PrintService.imprimirHtml(html, ts('doc.proposta.print.fileTitle', { project: proposta.nomeProjeto }))
  }

  return (
    <Stack spacing={2}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField fullWidth size="small" label={ts('doc.form.nomeProjeto')} value={proposta.nomeProjeto} onChange={setField('nomeProjeto')} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField fullWidth size="small" label={ts('doc.form.nomeCliente')} value={proposta.nomeCliente} onChange={setField('nomeCliente')} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField fullWidth size="small" label={ts('doc.proposta.empresa')} value={proposta.nomeEmpresa} onChange={setField('nomeEmpresa')} />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField fullWidth size="small" label={ts('doc.common.cnpj')} value={proposta.cnpjEmpresa} onChange={setField('cnpjEmpresa')} />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField fullWidth size="small" label={ts('doc.common.phone')} value={proposta.telefoneEmpresa} onChange={setField('telefoneEmpresa')} />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Divider><Typography variant="caption">{ts('doc.proposta.valores')}</Typography></Divider>
        </Grid>
        {[
          { label: ts('doc.proposta.totalMateriais'), key: 'totalMateriais' as const },
          { label: ts('doc.proposta.totalServicos'), key: 'totalServicos' as const },
          { label: ts('doc.proposta.totalProjeto'), key: 'totalProjeto' as const },
        ].map(({ label, key }) => (
          <Grid key={key} size={{ xs: 12, md: 4 }}>
            <TextField fullWidth size="small" type="number" label={label} value={proposta[key]} onChange={setField(key)}
              slotProps={{ input: { startAdornment: <Typography variant="caption" sx={{ mr: 0.5 }}>R$</Typography> } }} />
          </Grid>
        ))}

        {total > 0 && (
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 1.5, bgcolor: 'primary.main', color: 'white', borderRadius: 1 }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography variant="h6">{ts('doc.proposta.totalGeral')}</Typography>
                <Typography variant="h6">R$ {total.toLocaleString(ts('crm.currency.locale'), { minimumFractionDigits: 2 })}</Typography>
              </Stack>
            </Paper>
          </Grid>
        )}

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField fullWidth size="small" label={ts('doc.proposta.condicoes')} value={proposta.condicoesPagamento} onChange={setField('condicoesPagamento')} />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField fullWidth size="small" type="number" label={ts('doc.proposta.prazo')} value={proposta.prazoExecucao} onChange={setField('prazoExecucao')}
            slotProps={{ input: { endAdornment: <Typography variant="caption">{ts('doc.common.days')}</Typography> } }} />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField fullWidth size="small" label={ts('doc.proposta.garantia')} value={proposta.garantia} onChange={setField('garantia')} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField fullWidth size="small" multiline rows={2} label={ts('doc.proposta.observacoes')} value={proposta.observacoes} onChange={setField('observacoes')} />
        </Grid>
      </Grid>

      <Button variant="contained" startIcon={<BusinessIcon />} onClick={handleImprimir}
        disabled={!proposta.nomeProjeto || !proposta.nomeCliente || total === 0}>
        {ts('doc.proposta.gerar')}
      </Button>
    </Stack>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export const PropostaComercialPanel = () => {
  const ts = useTranslationService()
  const [tab, setTab] = useState(0)

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <AssignmentIcon color="primary" />
        <Typography variant="h6">{ts('doc.proposta.title')}</Typography>
      </Stack>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Tab label={ts('doc.art.title')} />
        <Tab label={ts('doc.proposta.tabTitle')} />
      </Tabs>

      <Box>
        {tab === 0 && <ARTPanel />}
        {tab === 1 && <PropostaPainel />}
      </Box>
    </Stack>
  )
}
