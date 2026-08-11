import { Grid, MenuItem, TextField } from '@mui/material'
import type { DashboardFilterState } from '@/modules/dashboard/types/dashboardTypes'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

type DashboardFiltersBarProps = {
  value: DashboardFilterState
  options: {
    responsaveis: string[]
    departamentos: string[]
    clientes: string[]
  }
  onChange: (value: DashboardFilterState) => void
}

export const DashboardFiltersBar = ({ value, options, onChange }: DashboardFiltersBarProps) => {
  const ts = useTranslationService()

  return (
    <Grid container spacing={1.5}>
      <Grid size={{ xs: 12, md: 3 }}>
        <TextField
          select
          fullWidth
          label={ts('dashboard.filters.period')}
          value={value.period}
          onChange={(event) => onChange({ ...value, period: event.target.value as DashboardFilterState['period'] })}
        >
          <MenuItem value="HOJE">{ts('dashboard.filters.today')}</MenuItem>
          <MenuItem value="7_DIAS">{ts('dashboard.filters.last7days')}</MenuItem>
          <MenuItem value="30_DIAS">{ts('dashboard.filters.last30days')}</MenuItem>
          <MenuItem value="90_DIAS">{ts('dashboard.filters.last90days')}</MenuItem>
          <MenuItem value="12_MESES">{ts('dashboard.filters.last12months')}</MenuItem>
        </TextField>
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <TextField
          select
          fullWidth
          label={ts('dashboard.filters.responsavel')}
          value={value.responsavel}
          onChange={(event) => onChange({ ...value, responsavel: event.target.value })}
        >
          <MenuItem value="TODOS">{ts('dashboard.filters.all')}</MenuItem>
          {options.responsaveis.map((item) => (
            <MenuItem key={item} value={item}>
              {item}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <TextField
          select
          fullWidth
          label={ts('dashboard.filters.departamento')}
          value={value.departamento}
          onChange={(event) => onChange({ ...value, departamento: event.target.value })}
        >
          <MenuItem value="TODOS">{ts('dashboard.filters.all')}</MenuItem>
          {options.departamentos.map((item) => (
            <MenuItem key={item} value={item}>
              {item}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <TextField
          select
          fullWidth
          label={ts('dashboard.filters.cliente')}
          value={value.cliente}
          onChange={(event) => onChange({ ...value, cliente: event.target.value })}
        >
          <MenuItem value="TODOS">{ts('dashboard.filters.all')}</MenuItem>
          {options.clientes.map((item) => (
            <MenuItem key={item} value={item}>
              {item}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
    </Grid>
  )
}
