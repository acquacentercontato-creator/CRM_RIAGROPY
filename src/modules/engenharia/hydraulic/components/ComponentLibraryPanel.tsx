/**
 * Biblioteca de componentes hidráulicos — busca e filtros
 */

import { useState } from 'react'
import {
  Box,
  Chip,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import type { HydraulicComponent, HydraulicComponentType, HydraulicManufacturer } from '../types/hydraulicTypes'
import { HYDRAULIC_CATALOG, CATALOG_STATS } from '../data/componentLibrary'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

const TIPO_COLOR: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  BOMBA: 'primary',
  TUBULACAO: 'default',
  CONEXAO: 'default',
  ASPERSOR: 'info',
  CANHAO: 'warning',
  CARRETEL: 'secondary',
  PIVO: 'error',
  FILTRO: 'success',
  VALVULA: 'info',
  MOTOR: 'secondary',
  SOFT_STARTER: 'warning',
  INVERSOR: 'warning',
}

const ComponentCard = ({ component }: { component: HydraulicComponent }) => {
  const ts = useTranslationService()
  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>{component.modelo}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>{component.fabricante} · {component.linha}</Typography>
        </Box>
        <Chip
          label={ts(`hydraulic.tipo.${component.tipo}`)}
          size="small"
          color={TIPO_COLOR[component.tipo] ?? 'default'}
          variant="outlined"
          sx={{ fontSize: 9, height: 18 }}
        />
      </Stack>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
        {ts(`hydraulic.catalog.${component.id.replace(/[^A-Za-z0-9]/g, '_')}`)}
      </Typography>

      <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.25 }}>
        {component.dn && (
          <Chip label={`DN${component.dn}`} size="small" sx={{ fontSize: 9, height: 16 }} />
        )}
        {component.pn && (
          <Chip label={`PN${component.pn}`} size="small" sx={{ fontSize: 9, height: 16 }} />
        )}
        {component.vazaoNominal && (
          <Chip label={`${component.vazaoNominal}m³/h`} size="small" color="info" sx={{ fontSize: 9, height: 16 }} />
        )}
        {component.pressaoNominal && (
          <Chip label={`${component.pressaoNominal}m.c.a`} size="small" color="primary" sx={{ fontSize: 9, height: 16 }} />
        )}
        {component.preco && (
          <Chip
            label={`R$ ${component.preco.toLocaleString(ts('crm.currency.locale'))}`}
            size="small"
            color="success"
            sx={{ fontSize: 9, height: 16 }}
          />
        )}
      </Stack>
    </Paper>
  )
}

export const ComponentLibraryPanel = () => {
  const ts = useTranslationService()
  const [search, setSearch] = useState('')
  const [filterTipo, setFilterTipo] = useState<HydraulicComponentType | ''>('')
  const [filterFab, setFilterFab] = useState<HydraulicManufacturer | ''>('')

  const filtered = HYDRAULIC_CATALOG.filter((c) => {
    if (filterTipo && c.tipo !== filterTipo) return false
    if (filterFab && c.fabricante !== filterFab) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        c.modelo.toLowerCase().includes(q) ||
        c.fabricante.toLowerCase().includes(q) ||
        c.descricao.toLowerCase().includes(q) ||
        c.codigo.toLowerCase().includes(q)
      )
    }
    return true
  })

  const tipos = Object.keys(CATALOG_STATS.porTipo) as HydraulicComponentType[]
  const fabricantes = Object.keys(CATALOG_STATS.porFabricante) as HydraulicManufacturer[]

  return (
    <Stack spacing={2}>
      {/* Stats */}
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
        <Chip label={ts('hydraulic.lib.componentCount', { count: CATALOG_STATS.totalComponentes })} size="small" color="primary" />
        {Object.entries(CATALOG_STATS.porFabricante).map(([fab, count]) => (
          <Chip key={fab} label={`${fab}: ${count}`} size="small" variant="outlined" />
        ))}
      </Stack>

      {/* Filters */}
      <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          label={ts('common.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 200 }}
        />
        <TextField
          select
          size="small"
          label={ts('hydraulic.lib.tipo')}
          value={filterTipo}
          onChange={(e) => setFilterTipo(e.target.value as HydraulicComponentType | '')}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">{ts('engenharia.table.all')}</MenuItem>
          {tipos.map((t) => (
            <MenuItem key={t} value={t}>{ts(`hydraulic.tipo.${t}`)}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label={ts('hydraulic.lib.fabricante')}
          value={filterFab}
          onChange={(e) => setFilterFab(e.target.value as HydraulicManufacturer | '')}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">{ts('engenharia.table.all')}</MenuItem>
          {fabricantes.map((f) => (
            <MenuItem key={f} value={f}>{f}</MenuItem>
          ))}
        </TextField>
      </Stack>

      <Typography variant="caption" color="text.secondary">
        {ts('hydraulic.lib.exibindo', { count: filtered.length })}
      </Typography>

      {/* Grid */}
      <Grid container spacing={1.5}>
        {filtered.map((comp) => (
          <Grid key={comp.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <ComponentCard component={comp} />
          </Grid>
        ))}
        {filtered.length === 0 && (
          <Grid size={{ xs: 12 }}>
            <Typography color="text.secondary">{ts('hydraulic.lib.semResultados')}</Typography>
          </Grid>
        )}
      </Grid>
    </Stack>
  )
}
