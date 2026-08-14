import { Delete, Edit, PictureAsPdf } from '@mui/icons-material'
import {
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
import { EcolifePdfService } from '@/modules/ecolife/services/EcolifePdfService'
import type { EcolifeDiagnostic } from '@/modules/ecolife/types/ecolifeTypes'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

export const EcolifeDiagnosticsTable = ({
  rows,
  onEdit,
  onDelete,
}: {
  rows: EcolifeDiagnostic[]
  onEdit: (item: EcolifeDiagnostic) => void
  onDelete: (item: EcolifeDiagnostic) => void
}) => {
  const ts = useTranslationService()
  return (
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
          {rows.map((row) => (
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
                  <IconButton onClick={() => EcolifePdfService.print(row, ts)}>
                    <PictureAsPdf />
                  </IconButton>
                </Tooltip>
                <Tooltip title={ts('actions.delete')}>
                  <IconButton color="error" onClick={() => onDelete(row)}>
                    <Delete />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
          {!rows.length && (
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
  )
}
