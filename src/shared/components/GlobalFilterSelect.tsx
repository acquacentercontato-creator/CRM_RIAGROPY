import { MenuItem, TextField } from '@mui/material'

type FilterOption = {
  value: string
  label: string
}

type GlobalFilterSelectProps = {
  label: string
  value: string
  options: FilterOption[]
  onChange: (value: string) => void
}

export const GlobalFilterSelect = ({ label, value, options, onChange }: GlobalFilterSelectProps) => {
  return (
    <TextField select label={label} value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  )
}
