import { zodResolver } from '@hookform/resolvers/zod'
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { GlobalFileUpload } from '@/shared/components/GlobalFileUpload'
import { WORKFLOW_TYPE_MAP } from '@/shared/workflow/WorkflowTypes'
import { useObrasDraft } from '@/modules/obras/hooks/useObrasDraft'
import { OBRAS_TIPO_OPTIONS } from '@/modules/obras/models/obrasModels'
import { ObrasService } from '@/modules/obras/services/ObrasService'
import type { Obra, ObraForm, ObrasUploadCategory } from '@/modules/obras/types/obrasTypes'
import { OBRAS_STATUS } from '@/modules/obras/types/obrasTypes'
import { createEmptyObraForm } from '@/modules/obras/utils/obrasUtils'
import { obraSchema } from '@/modules/obras/validators/obrasValidators'
import { ObrasTimeline } from '@/modules/obras/components/ObrasTimeline'

type ObraFormDialogProps = {
  open: boolean
  editing: Obra | null
  loading: boolean
  onClose: () => void
  onSubmit: (payload: ObraForm) => Promise<void>
  onUpload: (id: string, category: ObrasUploadCategory, files: File[]) => Promise<Obra>
}

const parseJsonSafe = <T,>(value: string, fallback: T): T => {
  if (!value.trim()) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export const ObraFormDialog = ({ open, editing, loading, onClose, onSubmit, onUpload }: ObraFormDialogProps) => {
  const [tab, setTab] = useState(0)
  const [info, setInfo] = useState('')

  const initial = useMemo<ObraForm>(() => {
    if (editing) {
      return {
        clienteNome: editing.clienteNome,
        projetoId: editing.projetoId,
        projetoNome: editing.projetoNome,
        projetoTipo: editing.projetoTipo,
        responsavelObra: editing.responsavelObra,
        status: editing.status,
        dataCriacaoObra: editing.dataCriacaoObra,
        dataInicio: editing.dataInicio,
        dataPrevista: editing.dataPrevista,
        dataEntrega: editing.dataEntrega,
        prioridade: editing.prioridade,
        observacoesPlanejamento: editing.observacoesPlanejamento,
        equipes: editing.equipes,
        cronograma: editing.cronograma,
        diarioObra: editing.diarioObra,
        checklist: editing.checklist,
        entregaTecnica: editing.entregaTecnica,
        fotos: editing.fotos,
        videos: editing.videos,
        documentos: editing.documentos,
        pdfs: editing.pdfs,
      }
    }

    const draft = ObrasService.loadDraft()
    return draft ?? createEmptyObraForm()
  }, [editing])

  const { control, reset, handleSubmit, setValue } = useForm<ObraForm>({
    resolver: zodResolver(obraSchema),
    defaultValues: initial,
  })

  const watched = useWatch({ control }) as ObraForm
  useObrasDraft(watched, open && !editing)

  useEffect(() => {
    if (open) {
      reset(initial)
    }
  }, [open, initial, reset])

  const handleUpload = async (category: ObrasUploadCategory, files: File[]) => {
    if (!editing) {
      setInfo('Salve a obra antes de enviar arquivos.')
      return
    }

    const updated = await onUpload(editing.id, category, files)
    setValue('fotos', updated.fotos)
    setValue('videos', updated.videos)
    setValue('documentos', updated.documentos)
    setValue('pdfs', updated.pdfs)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>{editing ? `Editar obra ${editing.codigoObra}` : 'Nova obra'}</DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 2 }}>
          <Tab label="Cadastro" />
          <Tab label="Planejamento" />
          <Tab label="Equipes/Cronograma" />
          <Tab label="Diario/Checklist" />
          <Tab label="Entrega Tecnica" />
          <Tab label="Uploads" />
          <Tab label="Timeline" />
        </Tabs>

        {info && <Alert severity="info" sx={{ mb: 2 }}>{info}</Alert>}

        {tab === 0 && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="clienteNome"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Cliente"
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="responsavelObra"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Responsavel"
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="projetoId"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Projeto Relacionado (ID)"
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="projetoNome"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Projeto Relacionado"
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="projetoTipo"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Tipo do Projeto" fullWidth>
                    {OBRAS_TIPO_OPTIONS.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type} - {WORKFLOW_TYPE_MAP[type]}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
          </Grid>
        )}

        {tab === 1 && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Controller
                name="dataCriacaoObra"
                control={control}
                render={({ field }) => (
                  <TextField {...field} type="date" label="Data criacao" fullWidth slotProps={{ inputLabel: { shrink: true } }} />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Controller
                name="dataInicio"
                control={control}
                render={({ field }) => (
                  <TextField {...field} type="date" label="Data inicio" fullWidth slotProps={{ inputLabel: { shrink: true } }} />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Controller
                name="dataPrevista"
                control={control}
                render={({ field }) => (
                  <TextField {...field} type="date" label="Data prevista" fullWidth slotProps={{ inputLabel: { shrink: true } }} />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Controller
                name="dataEntrega"
                control={control}
                render={({ field }) => (
                  <TextField {...field} type="date" label="Data entrega" fullWidth slotProps={{ inputLabel: { shrink: true } }} />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="prioridade"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Prioridade" fullWidth>
                    <MenuItem value="BAIXA">Baixa</MenuItem>
                    <MenuItem value="MEDIA">Media</MenuItem>
                    <MenuItem value="ALTA">Alta</MenuItem>
                    <MenuItem value="CRITICA">Critica</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Status" fullWidth>
                    {OBRAS_STATUS.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status.replaceAll('_', ' ')}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="observacoesPlanejamento"
                control={control}
                render={({ field }) => <TextField {...field} label="Observacoes" multiline minRows={3} fullWidth />}
              />
            </Grid>
          </Grid>
        )}

        {tab === 2 && (
          <Stack spacing={2}>
            <Controller
              name="equipes"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Equipes (JSON)"
                  multiline
                  minRows={6}
                  fullWidth
                  value={JSON.stringify(field.value, null, 2)}
                  onChange={(event) => field.onChange(parseJsonSafe(event.target.value, []))}
                />
              )}
            />
            <Controller
              name="cronograma"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Cronograma (JSON)"
                  multiline
                  minRows={6}
                  fullWidth
                  value={JSON.stringify(field.value, null, 2)}
                  onChange={(event) => field.onChange(parseJsonSafe(event.target.value, []))}
                />
              )}
            />
          </Stack>
        )}

        {tab === 3 && (
          <Stack spacing={2}>
            <Controller
              name="diarioObra"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Diario de obra (JSON)"
                  multiline
                  minRows={6}
                  fullWidth
                  value={JSON.stringify(field.value, null, 2)}
                  onChange={(event) => field.onChange(parseJsonSafe(event.target.value, []))}
                />
              )}
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 2.4 }}>
                <Controller
                  name="checklist.materiais"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />}
                      label="Materiais"
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2.4 }}>
                <Controller
                  name="checklist.equipamentos"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />}
                      label="Equipamentos"
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2.4 }}>
                <Controller
                  name="checklist.seguranca"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />}
                      label="Seguranca"
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2.4 }}>
                <Controller
                  name="checklist.testes"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />}
                      label="Testes"
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2.4 }}>
                <Controller
                  name="checklist.entrega"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />}
                      label="Entrega"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Stack>
        )}

        {tab === 4 && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Controller
                name="entregaTecnica.data"
                control={control}
                render={({ field }) => (
                  <TextField {...field} type="date" label="Data" fullWidth slotProps={{ inputLabel: { shrink: true } }} />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Controller
                name="entregaTecnica.responsavel"
                control={control}
                render={({ field }) => <TextField {...field} label="Responsavel" fullWidth />}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Controller
                name="entregaTecnica.assinatura"
                control={control}
                render={({ field }) => <TextField {...field} label="Assinatura" fullWidth />}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 12 }}>
              <Controller
                name="entregaTecnica.observacoes"
                control={control}
                render={({ field }) => <TextField {...field} label="Observacoes" multiline minRows={3} fullWidth />}
              />
            </Grid>
          </Grid>
        )}

        {tab === 5 && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <GlobalFileUpload title="Fotos" category="FOTO" files={watched.fotos} onUpload={async (files) => handleUpload('FOTO', files)} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <GlobalFileUpload title="Videos" category="VIDEO" files={watched.videos} onUpload={async (files) => handleUpload('VIDEO', files)} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <GlobalFileUpload title="PDFs" category="PDF" files={watched.pdfs} onUpload={async (files) => handleUpload('PDF', files)} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <GlobalFileUpload
                title="Documentos"
                category="OUTRO"
                files={watched.documentos}
                onUpload={async (files) => handleUpload('OUTRO', files)}
              />
            </Grid>
          </Grid>
        )}

        {tab === 6 && <ObrasTimeline events={editing?.timeline ?? []} />}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" disabled={loading} onClick={handleSubmit(onSubmit)}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
