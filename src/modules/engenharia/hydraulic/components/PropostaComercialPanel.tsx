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
  <div class="empresa">ANOTAÇÃO DE RESPONSABILIDADE TÉCNICA — ART</div>
  <div class="doc-tipo">Sistema de Irrigação e Drenagem</div>
</div>
<div style="page-break-before:always"></div>
<h1>ANOTAÇÃO DE RESPONSABILIDADE TÉCNICA — ART</h1>
<p style="text-align:center;color:#666;font-size:9pt">Conforme Lei 6.496/77 e Resolução 1025/09 do CONFEA</p>

<h2>1. DADOS DO RESPONSÁVEL TÉCNICO</h2>
<pre>
Nome: ${art.nomeResponsavel}
CPF: ${art.cpf}
CREA: ${art.crea}
Telefone: ${art.telefone}
E-mail: ${art.email}
</pre>

<h2>2. DADOS DO CONTRATANTE</h2>
<pre>
Nome / Razão Social: ${art.nomeCliente}
CPF / CNPJ: ${art.cpfCnpjCliente}
Endereço da obra: ${art.enderecoObra}
Município / UF: ${art.municipioObra} / ${art.ufObra}
</pre>

<h2>3. DESCRIÇÃO DA ATIVIDADE</h2>
<pre>${art.descricaoAtividade || 'Projeto, supervisão e execução de sistema de irrigação por aspersão.'}</pre>

<h2>4. CRONOGRAMA</h2>
<pre>
Data de início: ${art.dataInicio}
Data de conclusão: ${art.dataConclsuao}
Valor do contrato: R$ ${art.valorContrato}
</pre>

<h2>5. DECLARAÇÃO</h2>
<p>
O profissional acima identificado declara, para os fins e efeitos do Art. 1° da Lei 6.496, de 7 de dezembro de 1977, 
que é responsável técnico pela atividade descrita neste documento, obrigando-se a cumprir os dispositivos legais, 
regulamentares e normativos pertinentes.
</p>

<p style="margin-top:20mm;text-align:center">
____________________________________<br/>
${art.nomeResponsavel}<br/>
CREA ${art.crea}<br/><br/>
${new Date().toLocaleDateString('pt-BR')}
</p>`

    PrintService.imprimirHtml(html, 'ART — ' + art.nomeResponsavel)
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
          { label: 'CPF', key: 'cpf' as const },
          { label: 'Telefone', key: 'telefone' as const },
          { label: 'E-mail', key: 'email' as const },
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
          { label: 'CPF / CNPJ', key: 'cpfCnpjCliente' as const, size: 3 },
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
            placeholder="Projeto, supervisão e execução de sistema de irrigação por aspersão convencional..." />
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
    condicoesPagamento: '50% entrada + 50% na entrega',
    totalMateriais: '', totalServicos: '',
    totalProjeto: '', prazoExecucao: '30',
    garantia: '12 meses', observacoes: '',
  })

  const setField = (key: keyof PropostaData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setProposta({ ...proposta, [key]: e.target.value })

  const total = (parseFloat(proposta.totalMateriais) || 0) + (parseFloat(proposta.totalServicos) || 0) +
    (parseFloat(proposta.totalProjeto) || 0)

  const handleImprimir = () => {
    const html = `
<div class="cover">
  <div class="empresa">${proposta.nomeEmpresa}</div>
  <div class="doc-tipo">PROPOSTA COMERCIAL</div>
  <div class="projeto">${proposta.nomeProjeto}</div>
  <div class="info">
    Cliente: ${proposta.nomeCliente}<br/>
    Data: ${new Date().toLocaleDateString('pt-BR')}<br/>
    Válida por: ${proposta.validadeProposta} dias
  </div>
</div>
<div style="page-break-before:always"></div>
<h1>PROPOSTA COMERCIAL</h1>
<h2>Sistema de Irrigação — ${proposta.nomeProjeto}</h2>

<h2>1. DADOS DA EMPRESA</h2>
<pre>
Empresa: ${proposta.nomeEmpresa}
CNPJ: ${proposta.cnpjEmpresa}
Telefone: ${proposta.telefoneEmpresa}
E-mail: ${proposta.emailEmpresa}
Endereço: ${proposta.enderecoEmpresa}
</pre>

<h2>2. CLIENTE</h2>
<pre>Nome / Razão Social: ${proposta.nomeCliente}</pre>

<h2>3. COMPOSIÇÃO DE PREÇOS</h2>
<table>
  <thead><tr><th>Item</th><th>Descrição</th><th style="text-align:right">Valor</th></tr></thead>
  <tbody>
    <tr><td>01</td><td>Materiais hidráulicos (conforme lista de materiais)</td><td style="text-align:right">R$ ${parseFloat(proposta.totalMateriais || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>
    <tr><td>02</td><td>Mão de obra e serviços de instalação</td><td style="text-align:right">R$ ${parseFloat(proposta.totalServicos || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>
    <tr><td>03</td><td>Projeto técnico, ART e documentação</td><td style="text-align:right">R$ ${parseFloat(proposta.totalProjeto || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>
  </tbody>
  <tfoot>
    <tr class="total-row"><td colspan="2"><strong>TOTAL GERAL</strong></td><td style="text-align:right"><strong>R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></td></tr>
  </tfoot>
</table>

<h2>4. CONDIÇÕES COMERCIAIS</h2>
<pre>
Condições de pagamento: ${proposta.condicoesPagamento}
Prazo de execução: ${proposta.prazoExecucao} dias corridos
Garantia do sistema: ${proposta.garantia}
Validade desta proposta: ${proposta.validadeProposta} dias
</pre>

${proposta.observacoes ? `<h2>5. OBSERVAÇÕES</h2><pre>${proposta.observacoes}</pre>` : ''}

<p style="margin-top:15mm;text-align:center">
Proposta válida até: ${new Date(Date.now() + parseInt(proposta.validadeProposta) * 86400000).toLocaleDateString('pt-BR')}<br/><br/>
____________________________________<br/>
${proposta.nomeEmpresa}<br/>
${proposta.emailEmpresa}
</p>`

    PrintService.imprimirHtml(html, `Proposta — ${proposta.nomeProjeto}`)
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
          <TextField fullWidth size="small" label="CNPJ" value={proposta.cnpjEmpresa} onChange={setField('cnpjEmpresa')} />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField fullWidth size="small" label="Telefone" value={proposta.telefoneEmpresa} onChange={setField('telefoneEmpresa')} />
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
                <Typography variant="h6">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Typography>
              </Stack>
            </Paper>
          </Grid>
        )}

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField fullWidth size="small" label={ts('doc.proposta.condicoes')} value={proposta.condicoesPagamento} onChange={setField('condicoesPagamento')} />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField fullWidth size="small" type="number" label={ts('doc.proposta.prazo')} value={proposta.prazoExecucao} onChange={setField('prazoExecucao')}
            slotProps={{ input: { endAdornment: <Typography variant="caption">dias</Typography> } }} />
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
