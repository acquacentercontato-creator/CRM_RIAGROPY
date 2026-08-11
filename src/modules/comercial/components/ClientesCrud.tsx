import {
  Chip,
  CircularProgress,
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
  Tooltip,
  Typography,
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
import { useAuth } from '@/auth/AuthContext'
import { PermissionService } from '@/shared/auth/PermissionService'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

const STATUS_COLOR: Record<string, 'success' | 'warning' | 'default'> = {
  ATIVO: 'success',
  PROSPECT: 'warning',
  INATIVO: 'default',
}

export const ClientesCrud = () => {
  const { data = [], isLoading } = useClientes()
  const { createCliente, updateCliente, deleteCliente } = useClienteMutations()
  const { user } = useAuth()
  const ts = useTranslationService()

  const canEdit = PermissionService.canEdit(user?.role)
  const canDelete = PermissionService.canDelete(user?.role)

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

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(0)
  }

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    setPage(0)
  }

  return (
    <Paper sx={{ p: 2 }}>
      <CrudSectionHeader
        title={ts('comercial.clientes.title')}
        actionLabel={ts('comercial.clientes.new')}
        onAction={() => {
          if (!canEdit) return
          setCreateOpen(true)
        }}
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          size="small"
          label={ts('common.search')}
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          fullWidth
        />
        <TextField
          size="small"
          select
          label={ts('common.status')}
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="TODOS">{ts('dashboard.filters.all')}</MenuItem>
          <MenuItem value="ATIVO">{ts('comercial.status.ATIVO')}</MenuItem>
          <MenuItem value="PROSPECT">{ts('comercial.status.PROSPECT')}</MenuItem>
          <MenuItem value="INATIVO">{ts('comercial.status.INATIVO')}</MenuItem>
        </TextField>
      </Stack>

      {isLoading ? (
        <Stack sx={{ alignItems: 'center', py: 4 }}>
          <CircularProgress size={32} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {ts('comercial.clientes.title')}...
          </Typography>
        </Stack>
      ) : (
        <>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{ts('common.code')}</TableCell>
                  <TableCell>{ts('comercial.clientes.nomeFantasia')}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{ts('comercial.clientes.razaoSocial')}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{ts('comercial.clientes.rucCnpj')}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{ts('common.city')}</TableCell>
                  <TableCell>{ts('common.status')}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>{ts('comercial.clientes.responsavel')}</TableCell>
                  <TableCell align="right">{ts('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.codigoInterno}</TableCell>
                    <TableCell>{item.nomeFantasia}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{item.razaoSocial}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{item.rucCnpj}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{item.cidade}</TableCell>
                    <TableCell>
                      <Chip
                        label={ts(`comercial.status.${item.status}`)}
                        color={STATUS_COLOR[item.status] ?? 'default'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>{item.responsavelComercial}</TableCell>
                    <TableCell align="right">
                      <Tooltip title={ts('comercial.details.tabs.dadosGerais')}>
                        <IconButton size="small" onClick={() => setDetailsTarget(item)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={ts('actions.edit')}>
                        <span>
                          <IconButton size="small" disabled={!canEdit} onClick={() => setEditTarget(item)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title={ts('actions.delete')}>
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            disabled={!canDelete}
                            onClick={() => setRemoveTarget(item)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {paginated.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      {search || statusFilter !== 'TODOS'
                        ? ts('common.emptyClient')
                        : ts('common.emptyClient')}
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
        </>
      )}

      <ClienteFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={async (payload) => {
          if (!canEdit) return
          await createCliente.mutateAsync(payload)
        }}
        loading={createCliente.isPending}
      />

      <ClienteFormDialog
        open={Boolean(editTarget)}
        onClose={() => setEditTarget(null)}
        initialData={editTarget ?? undefined}
        onSubmit={async (payload) => {
          if (!canEdit) return
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
        title={ts('comercial.delete.clienteTitle')}
        description={ts('comercial.delete.clienteDescription', {
          nome: removeTarget?.nomeFantasia || removeTarget?.razaoSocial || ts('comercial.clientes.title').toLowerCase(),
        })}
        loading={deleteCliente.isPending}
        onCancel={() => setRemoveTarget(null)}
        onConfirm={async () => {
          if (!canDelete) return
          if (!removeTarget) return
          await deleteCliente.mutateAsync(removeTarget.id)
          setRemoveTarget(null)
        }}
      />
    </Paper>
  )
}

export const ClientesCrud = () => {
  const { data = [], isLoading } = useClientes()
  const { createCliente, updateCliente, deleteCliente } = useClienteMutations()
  const { user } = useAuth()
  const ts = useTranslationService()

  const canEdit = PermissionService.canEdit(user?.role)
  const canDelete = PermissionService.canDelete(user?.role)

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
      <CrudSectionHeader
        title={ts('comercial.clientes.title')}
        actionLabel={ts('comercial.clientes.new')}
        onAction={() => {
          if (!canEdit) return
          setCreateOpen(true)
        }}
      />

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField label={ts('common.search')} value={search} onChange={(e) => handleSearchChange(e.target.value)} fullWidth />
        <TextField
          select
          label={ts('common.status')}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="TODOS">{ts('dashboard.filters.all')}</MenuItem>
          <MenuItem value="ATIVO">{ts('comercial.status.ATIVO')}</MenuItem>
          <MenuItem value="PROSPECT">{ts('comercial.status.PROSPECT')}</MenuItem>
          <MenuItem value="INATIVO">{ts('comercial.status.INATIVO')}</MenuItem>
        </TextField>
      </Stack>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{ts('common.code')}</TableCell>
              <TableCell>{ts('comercial.clientes.nomeFantasia')}</TableCell>
              <TableCell>{ts('comercial.clientes.razaoSocial')}</TableCell>
              <TableCell>{ts('comercial.clientes.rucCnpj')}</TableCell>
              <TableCell>{ts('common.city')}</TableCell>
              <TableCell>{ts('common.status')}</TableCell>
              <TableCell>{ts('comercial.clientes.responsavel')}</TableCell>
              <TableCell align="right">{ts('common.actions')}</TableCell>
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
                  <IconButton size="small" disabled={!canEdit} onClick={() => setEditTarget(item)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    disabled={!canDelete}
                    onClick={() => setRemoveTarget(item)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  {ts('common.emptyClient')}
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
          if (!canEdit) return
          await createCliente.mutateAsync(payload)
        }}
        loading={createCliente.isPending}
      />

      <ClienteFormDialog
        open={Boolean(editTarget)}
        onClose={() => setEditTarget(null)}
        initialData={editTarget ?? undefined}
        onSubmit={async (payload) => {
          if (!canEdit) return
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
        title={ts('comercial.delete.clienteTitle')}
        description={ts('comercial.delete.clienteDescription', {
          nome: removeTarget?.nomeFantasia || removeTarget?.razaoSocial || ts('comercial.clientes.title').toLowerCase(),
        })}
        loading={deleteCliente.isPending}
        onCancel={() => setRemoveTarget(null)}
        onConfirm={async () => {
          if (!canDelete) return
          if (!removeTarget) return
          await deleteCliente.mutateAsync(removeTarget.id)
          setRemoveTarget(null)
        }}
      />
    </Paper>
  )
}
