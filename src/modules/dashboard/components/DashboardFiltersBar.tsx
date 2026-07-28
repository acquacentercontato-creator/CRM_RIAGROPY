import { Grid, MenuItem, TextField } from '@mui/material'
import type { DashboardFilterState } from '@/modules/dashboard/types/dashboardTypes'

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
  return (
    <Grid container spacing={1.5}>
      <Grid size={{ xs: 12, md: 3 }}>
        <TextField
          select
          fullWidth
          label="Periodo"
          value={value.period}
          onChange={(event) => onChange({ ...value, period: event.target.value as DashboardFilterState['period'] })}
        >
          <MenuItem value="HOJE">Hoje</MenuItem>
          <MenuItem value="7_DIAS">Ultimos 7 dias</MenuItem>
          <MenuItem value="30_DIAS">Ultimos 30 dias</MenuItem>
          <MenuItem value="90_DIAS">Ultimos 90 dias</MenuItem>
          <MenuItem value="12_MESES">Ultimos 12 meses</MenuItem>
        </TextField>
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <TextField
          select
          fullWidth
          label="Responsavel"
          value={value.responsavel}
          onChange={(event) => onChange({ ...value, responsavel: event.target.value })}
        >
          <MenuItem value="TODOS">Todos</MenuItem>
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
          label="Departamento"
          value={value.departamento}
          onChange={(event) => onChange({ ...value, departamento: event.target.value })}
        >
          <MenuItem value="TODOS">Todos</MenuItem>
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
          label="Cliente"
          value={value.cliente}
          onChange={(event) => onChange({ ...value, cliente: event.target.value })}
        >
          <MenuItem value="TODOS">Todos</MenuItem>
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
