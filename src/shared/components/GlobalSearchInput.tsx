import { TextField } from '@mui/material'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

type GlobalSearchInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export const GlobalSearchInput = ({ value, onChange, placeholder }: GlobalSearchInputProps) => {
  const ts = useTranslationService()

  return (
    <TextField
      fullWidth
      label={ts('common.search')}
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}
