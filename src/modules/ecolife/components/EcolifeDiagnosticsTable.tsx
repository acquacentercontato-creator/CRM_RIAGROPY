import { ContentCopy, Delete, Edit, PictureAsPdf } from '@mui/icons-material'
import {
  Chip,
  IconButton,
  Paper,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  TextField,
  Typography,
} from '@mui/material'
import { EcolifePdfService } from '@/modules/ecolife/services/EcolifePdfService'
import type { EcolifeDiagnostic } from '@/modules/ecolife/types/ecolifeTypes'
import { useTranslationService } from '@/shared/hooks/useTranslationService'
import { useMemo, useState } from 'react'
import { ECOLIFE_STATUS, type EcolifeStatus } from '@/modules/ecolife/types/ecolifeTypes'

export const EcolifeDiagnosticsTable = ({
  rows,
  onEdit,
  onDelete,
  onDuplicate,
  onPdf,
}: {
  rows: EcolifeDiagnostic[]
  onEdit: (item: EcolifeDiagnostic) => void
  onDelete: (item: EcolifeDiagnostic) => void
  onDuplicate: (item: EcolifeDiagnostic) => void
  onPdf: (item: EcolifeDiagnostic) => void
}) => {
  const ts = useTranslationService()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<EcolifeStatus | 'ALL'>('ALL')
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    return rows.filter((row) =>
      (status === 'ALL' || row.status === status) &&
      (!query || [row.code, row.propertyName, row.municipality, row.department].some((value) => value.toLocaleLowerCase().includes(query)))
    )
  }, [rows, search, status])
  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField fullWidth label={ts('ecolife.filters.search')} value={search} onChange={(event) => setSearch(event.target.value)} />
        <TextField select label={ts('ecolife.filters.status')} value={status} onChange={(event) => setStatus(event.target.value as EcolifeStatus | 'ALL')} sx={{ minWidth: 220 }}>
          <MenuItem value="ALL">{ts('ecolife.filters.all')}</MenuItem>
          {ECOLIFE_STATUS.map((value) => <MenuItem key={value} value={value}>{ts(`ecolife.status.${value}`)}</MenuItem>)}
        </TextField>
      </Stack>
      <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            {['code', 'property', 'product', 'status', 'updated', 'actions'].map((key) => (
              <TableCell key={key}>{ts(`ecolife.table.${key}`)}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.code}</TableCell>
              <TableCell>{row.propertyName}</TableCell>
              <TableCell>{ts(`ecolife.products.${row.product}`)}</TableCell>
              <TableCell>
                <Chip size="small" label={ts(`ecolife.status.${row.status}`)} />
              </TableCell>
              <TableCell>
                {new Date(row.updatedAt).toLocaleDateString(ts('ecolife.locale'))}
              </TableCell>
              <TableCell>
                <Tooltip title={ts('actions.edit')}>
                  <IconButton onClick={() => onEdit(row)}>
                    <Edit />
                  </IconButton>
                </Tooltip>
                <Tooltip title={ts('ecolife.actions.pdf')}>
                  <IconButton onClick={() => { onPdf(row); EcolifePdfService.print(row, ts) }}>
                    <PictureAsPdf />
                  </IconButton>
                </Tooltip>
                <Tooltip title={ts('ecolife.actions.duplicate')}><IconButton onClick={() => onDuplicate(row)}><ContentCopy /></IconButton></Tooltip>
                <Tooltip title={ts('actions.delete')}>
                  <IconButton color="error" onClick={() => onDelete(row)}>
                    <Delete />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
          {!filtered.length && (
            <TableRow>
              <TableCell colSpan={6}>
                <Typography align="center" color="text.secondary">
                  {ts('ecolife.table.empty')}
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </TableContainer>
    </Stack>
  )
}
