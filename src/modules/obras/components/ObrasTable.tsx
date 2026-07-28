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
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import ConstructionIcon from '@mui/icons-material/Construction'
import { useMemo, useState } from 'react'
import { OBRAS_STATUS } from '@/modules/obras/types/obrasTypes'
import type { Obra, ObraStatus } from '@/modules/obras/types/obrasTypes'
import { ObrasStatusChip } from '@/modules/obras/components/ObrasStatusChip'

type ObrasTableProps = {
  rows: Obra[]
  onCreate: () => void
  onEdit: (row: Obra) => void
  onDelete: (row: Obra) => void
  onNextStatus: (row: Obra) => void
}

export const ObrasTable = ({ rows, onCreate, onEdit, onDelete, onNextStatus }: ObrasTableProps) => {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'TODOS' | ObraStatus>('TODOS')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const filtered = useMemo(() => {
    return [...rows]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .filter((item) => {
        const term = `${item.codigoObra} ${item.clienteNome} ${item.projetoNome} ${item.responsavelObra}`.toLowerCase()
        const matchText = term.includes(search.toLowerCase())
        const matchStatus = status === 'TODOS' || item.status === status
        return matchText && matchStatus
      })
  }, [rows, search, status])

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField label="Pesquisa" value={search} onChange={(event) => setSearch(event.target.value)} fullWidth />
        <TextField
          select
          label="Status"
          value={status}
          sx={{ minWidth: 220 }}
          onChange={(event) => {
            setStatus(event.target.value as 'TODOS' | ObraStatus)
            setPage(0)
          }}
        >
          <MenuItem value="TODOS">Todos</MenuItem>
          {OBRAS_STATUS.map((item) => (
            <MenuItem key={item} value={item}>
              {item.replaceAll('_', ' ')}
            </MenuItem>
          ))}
        </TextField>
        <Button variant="contained" onClick={onCreate}>
          Nova obra
        </Button>
      </Stack>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Codigo</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Projeto</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Inicio</TableCell>
              <TableCell>Prevista</TableCell>
              <TableCell align="right">Acoes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.codigoObra}</TableCell>
                <TableCell>{row.clienteNome}</TableCell>
                <TableCell>{row.projetoNome}</TableCell>
                <TableCell>
                  <ObrasStatusChip status={row.status} />
                </TableCell>
                <TableCell>{row.dataInicio || '-'}</TableCell>
                <TableCell>{row.dataPrevista || '-'}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => onEdit(row)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="info" onClick={() => onNextStatus(row)}>
                    <ConstructionIcon fontSize="small" />
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
                  Nenhuma obra encontrada.
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
