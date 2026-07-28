import { TextField } from '@mui/material'

type GlobalSearchInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export const GlobalSearchInput = ({ value, onChange, placeholder }: GlobalSearchInputProps) => {
  return (
    <TextField
      fullWidth
      label="Busca"
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}
