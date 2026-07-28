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
import SendIcon from '@mui/icons-material/Send'
import { useMemo, useState } from 'react'
import type { RiegoLevantamento } from '@/modules/riego/types/riegoTypes'
import { RiegoStatusChip } from './RiegoStatusChip'
import { segmentoLabel } from '@/modules/riego/utils/riegoUtils'

type RiegoLevantamentosTableProps = {
  rows: RiegoLevantamento[]
  onCreate: () => void
  onEdit: (row: RiegoLevantamento) => void
  onDelete: (row: RiegoLevantamento) => void
  onSend: (row: RiegoLevantamento) => void
}

export const RiegoLevantamentosTable = ({
  rows,
  onCreate,
  onEdit,
  onDelete,
  onSend,
}: RiegoLevantamentosTableProps) => {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const filtered = useMemo(() => {
    return [...rows]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .filter((item) => {
        const target = `${item.codigo} ${item.clienteNome} ${item.propriedade} ${item.responsavel}`
        return target.toLowerCase().includes(search.toLowerCase())
      })
  }, [rows, search])

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField label="Pesquisa" value={search} onChange={(e) => setSearch(e.target.value)} fullWidth />
        <Button variant="contained" onClick={onCreate}>
          Novo levantamento
        </Button>
      </Stack>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Codigo</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Segmento</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Responsavel</TableCell>
              <TableCell>Atualizado</TableCell>
              <TableCell align="right">Acoes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.codigo}</TableCell>
                <TableCell>{row.clienteNome}</TableCell>
                <TableCell>{segmentoLabel(row.segmento)}</TableCell>
                <TableCell>
                  <RiegoStatusChip status={row.status} />
                </TableCell>
                <TableCell>{row.responsavel}</TableCell>
                <TableCell>{new Date(row.updatedAt).toLocaleString()}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => onEdit(row)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="warning"
                    disabled={row.status === 'ENVIADO_ENGENHARIA'}
                    onClick={() => onSend(row)}
                  >
                    <SendIcon fontSize="small" />
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
                  Nenhum levantamento encontrado.
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
