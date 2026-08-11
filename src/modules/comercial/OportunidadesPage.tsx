import { useState } from 'react'
import { Alert, Button, Divider, Paper, Stack, Tab, Tabs, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { ComercialShell } from '@/modules/comercial/components/ComercialShell'
import { OportunidadesBoard } from '@/modules/comercial/components/OportunidadesBoard'
import { CRMFunilView } from '@/modules/comercial/components/CRMFunilView'
import { CRMKpiPanel } from '@/modules/comercial/components/CRMKpiPanel'
import { OportunidadeFormDialog } from '@/modules/comercial/components/OportunidadeFormDialog'
import {
  useOportunidades,
  useOportunidadeMutations,
  useVisitas,
} from '@/modules/comercial/hooks/useComercialData'
import type { FunilEtapa, Oportunidade } from '@/modules/comercial/types'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

export const OportunidadesPage = () => {
  const ts = useTranslationService()
  const { data: oportunidades = [] } = useOportunidades()
  const { data: visitas = [] } = useVisitas()
  const { createOportunidade, updateOportunidade } = useOportunidadeMutations()
  const [tab, setTab] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Oportunidade | null>(null)

  const handleMover = async (id: string, novaEtapa: FunilEtapa) => {
    await updateOportunidade.mutateAsync({ id, payload: { etapaFunil: novaEtapa } })
  }

  return (
    <ComercialShell>
      <Stack spacing={2}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">{ts('crm.dashboard.title')}</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => { setEditing(null); setDialogOpen(true) }}
          >
            {ts('crm.dashboard.novaOportunidade')}
          </Button>
        </Stack>

        <Alert severity="info">{ts('pages.oportunidades.title')}</Alert>

        {/* KPIs */}
        <CRMKpiPanel oportunidades={oportunidades} visitas={visitas} />

        <Divider />

        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label={ts('crm.dashboard.funil')} />
          <Tab label={ts('crm.dashboard.board')} />
        </Tabs>

        {tab === 0 && (
          <Paper sx={{ p: 2 }}>
            <CRMFunilView
              oportunidades={oportunidades}
              onMover={handleMover}
              onEditar={(op) => { setEditing(op); setDialogOpen(true) }}
            />
          </Paper>
        )}

        {tab === 1 && <OportunidadesBoard />}

        <OportunidadeFormDialog
          open={dialogOpen}
          editing={editing}
          loading={createOportunidade.isPending || updateOportunidade.isPending}
          onClose={() => setDialogOpen(false)}
          onSubmit={async (payload) => {
            if (editing) {
              await updateOportunidade.mutateAsync({ id: editing.id, payload })
            } else {
              await createOportunidade.mutateAsync(payload)
            }
          }}
        />
      </Stack>
    </ComercialShell>
  )
}
