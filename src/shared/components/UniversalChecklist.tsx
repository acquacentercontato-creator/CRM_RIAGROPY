/**
 * Checklist universal reutilizável em todos os módulos técnicos
 */

import {
  Box,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

export interface ChecklistItem {
  id: string
  label: string
  done: boolean
  obrigatorio?: boolean
}

interface UniversalChecklistProps {
  items: ChecklistItem[]
  title?: string
  readonly?: boolean
  onChange?: (id: string, done: boolean) => void
}

export const UniversalChecklist = ({ items, title, readonly = false, onChange }: UniversalChecklistProps) => {
  const ts = useTranslationService()

  const total = items.length
  const concluidos = items.filter((i) => i.done).length
  const percent = total > 0 ? Math.round((concluidos / total) * 100) : 0
  const obrigatoriosPendentes = items.filter((i) => i.obrigatorio && !i.done)

  const progressColor = percent === 100 ? 'success' : percent > 50 ? 'primary' : 'warning'

  return (
    <Stack spacing={1}>
      {title && <Typography variant="subtitle2">{title}</Typography>}

      {/* Progress bar */}
      <Stack spacing={0.25}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {concluidos}/{total} {ts('technical.checklist.itens')}
          </Typography>
          <Stack direction="row" spacing={0.5}>
            <Chip
              label={`${percent}%`}
              size="small"
              color={progressColor}
              variant="outlined"
              sx={{ fontSize: 10, height: 18 }}
            />
            {obrigatoriosPendentes.length > 0 && (
              <Chip
                label={ts('technical.checklist.pendentes', { count: obrigatoriosPendentes.length })}
                size="small"
                color="error"
                sx={{ fontSize: 10, height: 18 }}
              />
            )}
          </Stack>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={percent}
          color={progressColor}
          sx={{ height: 6, borderRadius: 3 }}
        />
      </Stack>

      <Divider />

      {/* Items */}
      <Stack spacing={0}>
        {items.map((item) => (
          <FormControlLabel
            key={item.id}
            control={
              <Checkbox
                checked={item.done}
                size="small"
                disabled={readonly}
                onChange={(e) => onChange?.(item.id, e.target.checked)}
                color={item.done ? 'success' : 'default'}
              />
            }
            label={
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <Typography
                  variant="caption"
                  sx={{
                    textDecoration: item.done ? 'line-through' : 'none',
                    color: item.done ? 'text.disabled' : 'text.primary',
                  }}
                >
                  {ts(item.label)}
                </Typography>
                {item.obrigatorio && !item.done && (
                  <Typography component="span" variant="caption" color="error">*</Typography>
                )}
              </Stack>
            }
          />
        ))}

        {items.length === 0 && (
          <Typography variant="caption" color="text.disabled">
            {ts('technical.checklist.vazio')}
          </Typography>
        )}
      </Stack>

      {percent === 100 && (
        <Box sx={{ bgcolor: 'success.light', borderRadius: 1, p: 0.75, opacity: 0.85 }}>
          <Typography variant="caption" color="success.dark" sx={{ fontWeight: 600 }}>
            ✓ {ts('technical.checklist.completo')}
          </Typography>
        </Box>
      )}
    </Stack>
  )
}
