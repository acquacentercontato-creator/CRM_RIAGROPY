import {
  Button,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import ReplayIcon from '@mui/icons-material/Replay'
import RequestQuoteIcon from '@mui/icons-material/RequestQuote'
import { useMemo, useState } from 'react'
import { useTranslationService } from '@/shared/hooks/useTranslationService'
import { ENGENHARIA_STATUS_OPTIONS } from '@/modules/engenharia/models/engenhariaModels'
import { EngenhariaStatusChip } from '@/modules/engenharia/components/EngenhariaStatusChip'
import type { EngenhariaProject, EngenhariaStatus } from '@/modules/engenharia/types/engenhariaTypes'

type EngenhariaProjectsTableProps = {
  rows: EngenhariaProject[]
  onCreate: () => void
  onEdit: (row: EngenhariaProject) => void
  onDelete: (row: EngenhariaProject) => void
  onCreateRevision: (row: EngenhariaProject) => void
  onSendBudget: (row: EngenhariaProject) => void
}

export const EngenhariaProjectsTable = ({
  rows,
  onCreate,
  onEdit,
  onDelete,
  onCreateRevision,
  onSendBudget,
}: EngenhariaProjectsTableProps) => {
  const ts = useTranslationService()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'TODOS' | EngenhariaStatus>('TODOS')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const filtered = useMemo(() => {
    return [...rows]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .filter((item) => {
        const target = `${item.codigoProjeto} ${item.clienteNome} ${item.titulo}`.toLowerCase()
        const matchSearch = target.includes(search.toLowerCase())
        const matchStatus = statusFilter === 'TODOS' || item.status === statusFilter
        return matchSearch && matchStatus
      })
  }, [rows, search, statusFilter])

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField label={ts('engenharia.table.search')} value={search} onChange={(event) => setSearch(event.target.value)} fullWidth />
        <TextField
          label={ts('engenharia.table.status')}
          value={statusFilter}
          select
          onChange={(event) => {
            setStatusFilter(event.target.value as 'TODOS' | EngenhariaStatus)
            setPage(0)
          }}
          sx={{ minWidth: 240 }}
        >
          <MenuItem value="TODOS">{ts('engenharia.table.all')}</MenuItem>
          {ENGENHARIA_STATUS_OPTIONS.map((status) => (
            <MenuItem key={status} value={status}>
              {ts(`engenharia.status.${status}`)}
            </MenuItem>
          ))}
        </TextField>
        <Button variant="contained" onClick={onCreate}>
          {ts('engenharia.newProject')}
        </Button>
      </Stack>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{ts('engenharia.table.codigo')}</TableCell>
              <TableCell>{ts('engenharia.table.cliente')}</TableCell>
              <TableCell>{ts('engenharia.table.tipo')}</TableCell>
              <TableCell>{ts('engenharia.table.status')}</TableCell>
              <TableCell>{ts('engenharia.table.revisoes')}</TableCell>
              <TableCell>{ts('engenharia.table.orcamento')}</TableCell>
              <TableCell align="right">{ts('engenharia.table.acoes')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.codigoProjeto}</TableCell>
                <TableCell>{row.clienteNome}</TableCell>
                <TableCell>{ts(`engenharia.types.${row.tipoProjeto}`)}</TableCell>
                <TableCell>
                  <EngenhariaStatusChip status={row.status} />
                </TableCell>
                <TableCell>{row.revisoes.length}</TableCell>
                <TableCell>{row.enviadoOrcamento ? ts('engenharia.table.yes') : ts('engenharia.table.no')}</TableCell>
                <TableCell align="right">
                  <Tooltip title={ts('actions.edit')}>
                    <IconButton size="small" onClick={() => onEdit(row)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={ts('engenharia.newRevision')}>
                    <IconButton size="small" color="warning" onClick={() => onCreateRevision(row)}>
                      <ReplayIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={ts('engenharia.table.orcamento')}>
                    <span>
                      <IconButton
                        size="small"
                        color="info"
                        disabled={row.enviadoOrcamento}
                        onClick={() => onSendBudget(row)}
                      >
                        <RequestQuoteIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title={ts('actions.delete')}>
                    <IconButton size="small" color="error" onClick={() => onDelete(row)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  {ts('engenharia.table.empty')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filtered.length}
        page={page}
        onPageChange={(_, next) => setPage(next)}
        rowsPerPage={rowsPerPage}
        labelRowsPerPage={ts('engenharia.table.rowsPerPage')}
        labelDisplayedRows={({ from, to, count }) =>
          ts('engenharia.table.displayedRows', { from, to, count })
        }
        onRowsPerPageChange={(event) => {
          setRowsPerPage(Number(event.target.value))
          setPage(0)
        }}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Paper>
  )
}
