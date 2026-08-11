import { Button, List, ListItem, ListItemText, Paper, Stack, Typography } from '@mui/material'
import type { RiegoMediaItem, RiegoMediaType } from '@/modules/riego/types/riegoTypes'
import { useAuth } from '@/auth/AuthContext'
import { PermissionService } from '@/shared/auth/PermissionService'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

type RiegoMediaUploaderProps = {
  title: string
  type: RiegoMediaType
  items: RiegoMediaItem[]
  onUpload: (files: File[], type: RiegoMediaType) => Promise<void>
}

export const RiegoMediaUploader = ({ title, type, items, onUpload }: RiegoMediaUploaderProps) => {
  const { user } = useAuth()
  const canUpload = PermissionService.canUpload(user?.role)
  const ts = useTranslationService()

  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <Stack spacing={1.5}>
        <Typography variant="subtitle2">{title}</Typography>
        <Button component="label" size="small" variant="outlined" disabled={!canUpload}>
          {ts('actions.upload')}
          <input
            hidden
            type="file"
            multiple
            disabled={!canUpload}
            onChange={async (event) => {
              if (!canUpload) return
              const fileList = Array.from(event.target.files ?? [])
              if (fileList.length === 0) return
              await onUpload(fileList, type)
              event.target.value = ''
            }}
          />
        </Button>
        <List dense>
          {items.map((item) => (
            <ListItem key={item.id} divider>
              <ListItemText primary={item.name} secondary={item.url} />
            </ListItem>
          ))}
          {items.length === 0 && <Typography color="text.secondary">{ts('common.noFiles')}</Typography>}
        </List>
      </Stack>
    </Paper>
  )
}
