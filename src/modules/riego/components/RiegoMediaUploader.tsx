import { Button, List, ListItem, ListItemText, Paper, Stack, Typography } from '@mui/material'
import type { RiegoMediaItem, RiegoMediaType } from '@/modules/riego/types/riegoTypes'

type RiegoMediaUploaderProps = {
  title: string
  type: RiegoMediaType
  items: RiegoMediaItem[]
  onUpload: (files: File[], type: RiegoMediaType) => Promise<void>
}

export const RiegoMediaUploader = ({ title, type, items, onUpload }: RiegoMediaUploaderProps) => {
  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <Stack spacing={1.5}>
        <Typography variant="subtitle2">{title}</Typography>
        <Button component="label" size="small" variant="outlined">
          Upload
          <input
            hidden
            type="file"
            multiple
            onChange={async (event) => {
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
          {items.length === 0 && <Typography color="text.secondary">Sem arquivos.</Typography>}
        </List>
      </Stack>
    </Paper>
  )
}
