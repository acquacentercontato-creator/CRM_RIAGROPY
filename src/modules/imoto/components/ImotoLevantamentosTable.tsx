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
import { ImotoStatusChip } from '@/modules/imoto/components/ImotoStatusChip'
import { useTranslationService } from '@/shared/hooks/useTranslationService'
import type { ImotoLevantamento } from '@/modules/imoto/types/imotoTypes'

type ImotoLevantamentosTableProps = {
  rows: ImotoLevantamento[]
  onCreate: () => void
  onEdit: (row: ImotoLevantamento) => void
  onDelete: (row: ImotoLevantamento) => void
  onSend: (row: ImotoLevantamento) => void
}

export const ImotoLevantamentosTable = ({
  rows,
  onCreate,
  onEdit,
  onDelete,
  onSend,
}: ImotoLevantamentosTableProps) => {
  const ts = useTranslationService()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const filtered = useMemo(() => {
    return [...rows]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .filter((item) => {
        const target = `${item.codigo} ${item.clienteNome} ${item.unidadeIndustrial} ${item.responsavelTecnico}`
        return target.toLowerCase().includes(search.toLowerCase())
      })
  }, [rows, search])

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField label={ts('imoto.table.search')} value={search} onChange={(e) => setSearch(e.target.value)} fullWidth />
        <Button variant="contained" onClick={onCreate}>
          {ts('imoto.newSurvey')}
        </Button>
      </Stack>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{ts('imoto.table.codigo')}</TableCell>
              <TableCell>{ts('imoto.table.cliente')}</TableCell>
              <TableCell>{ts('imoto.table.segmento')}</TableCell>
              <TableCell>{ts('imoto.table.status')}</TableCell>
              <TableCell>{ts('imoto.table.responsavel')}</TableCell>
              <TableCell>{ts('imoto.table.atualizado')}</TableCell>
              <TableCell align="right">{ts('imoto.table.acoes')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.codigo}</TableCell>
                <TableCell>{row.clienteNome}</TableCell>
                <TableCell>{ts(`imoto.segments.${row.segmento}`)}</TableCell>
                <TableCell>
                  <ImotoStatusChip status={row.status} />
                </TableCell>
                <TableCell>{row.responsavelTecnico}</TableCell>
                <TableCell>{new Date(row.updatedAt).toLocaleString(ts('imoto.locale'))}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => onEdit(row)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="warning" disabled={row.status === 'ENVIADO'} onClick={() => onSend(row)}>
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
                  {ts('imoto.table.empty')}
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
