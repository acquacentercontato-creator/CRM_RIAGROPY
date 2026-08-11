/**
 * Página principal do módulo de Engenharia Hidráulica
 */

import { useState } from 'react'
import { Alert, Paper, Stack, Tab, Tabs, Typography } from '@mui/material'
import WaterIcon from '@mui/icons-material/Water'
import { useTranslationService } from '@/shared/hooks/useTranslationService'
import { HydraulicCalculatorPanel } from './components/HydraulicCalculatorPanel'
import { PumpAssistantPanel } from './components/PumpAssistantPanel'
import { ComponentLibraryPanel } from './components/ComponentLibraryPanel'
import { DocumentGeneratorPanel } from './components/DocumentGeneratorPanel'
import { PropostaComercialPanel } from './components/PropostaComercialPanel'
import { ProcurementPanel } from './components/ProcurementPanel'
import { CATALOG_STATS } from './data/componentLibrary'

export const HydraulicPage = () => {
  const ts = useTranslationService()
  const [tab, setTab] = useState(0)

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <WaterIcon color="primary" sx={{ fontSize: 32 }} />
        <Stack>
          <Typography variant="h5">{ts('hydraulic.title')}</Typography>
          <Typography variant="caption" color="text.secondary">{ts('hydraulic.subtitle')}</Typography>
        </Stack>
      </Stack>

      <Alert severity="info">
        {ts('hydraulic.info', {
          componentes: CATALOG_STATS.totalComponentes,
          fabricantes: Object.keys(CATALOG_STATS.porFabricante).length,
        })}
      </Alert>

      {/* Tabs */}
      <Paper sx={{ p: 0 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
          <Tab label={ts('hydraulic.tabs.calculadora')} />
          <Tab label={ts('hydraulic.tabs.assistente')} />
          <Tab label={ts('hydraulic.tabs.biblioteca')} />
          <Tab label={ts('hydraulic.tabs.documentos')} />
          <Tab label={ts('hydraulic.tabs.proposta')} />
          <Tab label={ts('hydraulic.tabs.suprimentos')} />
        </Tabs>

        <Stack sx={{ p: 2 }}>
          {tab === 0 && <HydraulicCalculatorPanel />}
          {tab === 1 && <PumpAssistantPanel />}
          {tab === 2 && <ComponentLibraryPanel />}
          {tab === 3 && <DocumentGeneratorPanel />}
          {tab === 4 && <PropostaComercialPanel />}
          {tab === 5 && <ProcurementPanel />}
        </Stack>
      </Paper>
    </Stack>
  )
}
