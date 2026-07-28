import { TablePagination } from '@mui/material'

type GlobalPaginationProps = {
  count: number
  page: number
  rowsPerPage: number
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rowsPerPage: number) => void
}

export const GlobalPagination = ({
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: GlobalPaginationProps) => {
  return (
    <TablePagination
      component="div"
      count={count}
      page={page}
      onPageChange={(_, next) => onPageChange(next)}
      rowsPerPage={rowsPerPage}
      rowsPerPageOptions={[5, 10, 25, 50]}
      onRowsPerPageChange={(event) => onRowsPerPageChange(Number(event.target.value))}
    />
  )
}
