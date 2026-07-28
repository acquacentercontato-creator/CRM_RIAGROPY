import {
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
  MenuItem,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { useMemo, useState } from 'react'
import type { Cliente } from '@/modules/comercial/types'
import { useClienteMutations, useClientes } from '@/modules/comercial/hooks/useComercialData'
import { ClienteFormDialog } from './ClienteFormDialog'
import { ClienteDetailsDialog } from './ClienteDetailsDialog'
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog'
import { CrudSectionHeader } from './CrudSectionHeader'

export const ClientesCrud = () => {
  const { data = [], isLoading } = useClientes()
  const { createCliente, updateCliente, deleteCliente } = useClienteMutations()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('TODOS')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Cliente | null>(null)
  const [detailsTarget, setDetailsTarget] = useState<Cliente | null>(null)
  const [removeTarget, setRemoveTarget] = useState<Cliente | null>(null)

  const filtered = useMemo(() => {
    const sorted = [...data].sort((a, b) => a.nomeFantasia.localeCompare(b.nomeFantasia))
    return sorted.filter((item) => {
      const text = `${item.codigoInterno} ${item.razaoSocial} ${item.nomeFantasia} ${item.rucCnpj} ${item.cidade}`
        .toLowerCase()
        .includes(search.toLowerCase())
      const statusOk = statusFilter === 'TODOS' || item.status === statusFilter
      return text && statusOk
    })
  }, [data, search, statusFilter])

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
    <Paper sx={{ p: 2 }}>
      <CrudSectionHeader title="Clientes" actionLabel="Novo Cliente" onAction={() => setCreateOpen(true)} />

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField label="Pesquisa" value={search} onChange={(e) => setSearch(e.target.value)} fullWidth />
        <TextField
          select
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="TODOS">Todos</MenuItem>
          <MenuItem value="ATIVO">Ativo</MenuItem>
          <MenuItem value="PROSPECT">Prospect</MenuItem>
          <MenuItem value="INATIVO">Inativo</MenuItem>
        </TextField>
      </Stack>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Codigo</TableCell>
              <TableCell>Nome Fantasia</TableCell>
              <TableCell>Razao Social</TableCell>
              <TableCell>RUC/CNPJ</TableCell>
              <TableCell>Cidade</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Responsavel</TableCell>
              <TableCell align="right">Acoes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell>{item.codigoInterno}</TableCell>
                <TableCell>{item.nomeFantasia}</TableCell>
                <TableCell>{item.razaoSocial}</TableCell>
                <TableCell>{item.rucCnpj}</TableCell>
                <TableCell>{item.cidade}</TableCell>
                <TableCell>{item.status}</TableCell>
                <TableCell>{item.responsavelComercial}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => setDetailsTarget(item)}>
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => setEditTarget(item)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => setRemoveTarget(item)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Nenhum cliente encontrado
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

      <ClienteFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={async (payload) => {
          await createCliente.mutateAsync(payload)
        }}
        loading={createCliente.isPending}
      />

      <ClienteFormDialog
        open={Boolean(editTarget)}
        onClose={() => setEditTarget(null)}
        initialData={editTarget ?? undefined}
        onSubmit={async (payload) => {
          if (!editTarget) return
          await updateCliente.mutateAsync({ id: editTarget.id, payload })
        }}
        loading={updateCliente.isPending}
      />

      <ClienteDetailsDialog
        open={Boolean(detailsTarget)}
        onClose={() => setDetailsTarget(null)}
        cliente={detailsTarget}
      />

      <ConfirmDeleteDialog
        open={Boolean(removeTarget)}
        title="Excluir cliente"
        description={`Confirma exclusao de ${removeTarget?.nomeFantasia || removeTarget?.razaoSocial || 'cliente'}?`}
        loading={deleteCliente.isPending}
        onCancel={() => setRemoveTarget(null)}
        onConfirm={async () => {
          if (!removeTarget) return
          await deleteCliente.mutateAsync(removeTarget.id)
          setRemoveTarget(null)
        }}
      />
    </Paper>
  )
}
