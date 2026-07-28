import {
  Button,
  IconButton,
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
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import ReplayIcon from '@mui/icons-material/Replay'
import RequestQuoteIcon from '@mui/icons-material/RequestQuote'
import { useMemo, useState } from 'react'
import { WORKFLOW_TYPE_MAP } from '@/shared/workflow/WorkflowTypes'
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
        <TextField label="Pesquisa" value={search} onChange={(event) => setSearch(event.target.value)} fullWidth />
        <TextField
          label="Status"
          value={statusFilter}
          select
          onChange={(event) => {
            setStatusFilter(event.target.value as 'TODOS' | EngenhariaStatus)
            setPage(0)
          }}
          sx={{ minWidth: 240 }}
        >
          <option value="TODOS">Todos</option>
          {ENGENHARIA_STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </TextField>
        <Button variant="contained" onClick={onCreate}>
          Novo projeto
        </Button>
      </Stack>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Codigo</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Revisoes</TableCell>
              <TableCell>Orcamento</TableCell>
              <TableCell align="right">Acoes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.codigoProjeto}</TableCell>
                <TableCell>{row.clienteNome}</TableCell>
                <TableCell>{WORKFLOW_TYPE_MAP[row.tipoProjeto]}</TableCell>
                <TableCell>
                  <EngenhariaStatusChip status={row.status} />
                </TableCell>
                <TableCell>{row.revisoes.length}</TableCell>
                <TableCell>{row.enviadoOrcamento ? 'Sim' : 'Nao'}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => onEdit(row)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="warning" onClick={() => onCreateRevision(row)}>
                    <ReplayIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="info"
                    disabled={row.enviadoOrcamento}
                    onClick={() => onSendBudget(row)}
                  >
                    <RequestQuoteIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => onDelete(row)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Nenhum projeto encontrado.
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
        onRowsPerPageChange={(event) => {
          setRowsPerPage(Number(event.target.value))
          setPage(0)
        }}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Paper>
  )
}
