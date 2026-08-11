import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material'
import type { UploadedFile, UploadFileCategory } from '@/shared/types/core'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

type GlobalFileUploadProps = {
  title: string
  category: UploadFileCategory
  files: UploadedFile[]
  onUpload: (files: File[], category: UploadFileCategory) => Promise<void>
}

const acceptMap: Record<UploadFileCategory, string> = {
  FOTO: 'image/*',
  VIDEO: 'video/*',
  PDF: '.pdf',
  DWG: '.dwg',
  DXF: '.dxf',
  KMZ: '.kmz',
  OUTRO: '*',
}

export const GlobalFileUpload = ({ title, category, files, onUpload }: GlobalFileUploadProps) => {
  const ts = useTranslationService()

  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <Stack spacing={1}>
        <Typography variant="subtitle2">{title}</Typography>
        <Button component="label" size="small" variant="outlined">
          {ts('actions.upload')}
          <input
            hidden
            type="file"
            multiple
            accept={acceptMap[category]}
            onChange={async (event) => {
              const items = Array.from(event.target.files ?? [])
              if (items.length === 0) return
              await onUpload(items, category)
              event.target.value = ''
            }}
          />
        </Button>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {files.map((item) => (
            <Chip key={item.id} label={item.name} size="small" />
          ))}
        </Box>
      </Stack>
    </Paper>
  )
}
