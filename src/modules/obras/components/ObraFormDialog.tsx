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
import { useTranslationService } from '@/shared/hooks/useTranslationService'
import { useObrasDraft } from '@/modules/obras/hooks/useObrasDraft'
import { OBRAS_TIPO_OPTIONS } from '@/modules/obras/models/obrasModels'
import { ObrasService } from '@/modules/obras/services/ObrasService'
import type { Obra, ObraForm, ObrasUploadCategory } from '@/modules/obras/types/obrasTypes'
import { OBRAS_STATUS } from '@/modules/obras/types/obrasTypes'
import { createEmptyObraForm } from '@/modules/obras/utils/obrasUtils'
import { obraSchema } from '@/modules/obras/validators/obrasValidators'
import { ObrasTimeline } from '@/modules/obras/components/ObrasTimeline'
import { ModuleAttachmentsTab } from '@/shared/attachments'
import { WorkflowPipelinePanel } from '@/shared/workflow/pipeline/components/WorkflowPipelinePanel'
import { useWorkflowPipeline } from '@/shared/workflow/pipeline/hooks/useWorkflowPipeline'
import { ApprovalPanel } from '@/shared/bpe/components/ApprovalPanel'
import { UniversalChecklist, type ChecklistItem } from '@/shared/components/UniversalChecklist'
import { AutomationService } from '@/shared/crm-automation'

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
  const ts = useTranslationService()
  const [tab, setTab] = useState(0)
  const [info, setInfo] = useState('')

  const { stepsStatus, updateChecklist } = useWorkflowPipeline(
    editing?.id ?? '__novo__',
    editing?.codigoObra ?? editing?.projetoNome ?? '',
    editing?.clienteNome ?? ''
  )

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
      setInfo(ts('obras.feedback.saveBeforeUpload'))
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
      <DialogTitle>{editing ? ts('obras.editWork', { codigo: editing.codigoObra }) : ts('obras.newWork')}</DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 2 }}>
          <Tab label={ts('obras.tabs.cadastro')} />
          <Tab label={ts('obras.tabs.planejamento')} />
          <Tab label={ts('obras.tabs.equipesCronograma')} />
          <Tab label={ts('obras.tabs.diarioChecklist')} />
          <Tab label={ts('obras.tabs.entregaTecnica')} />
          <Tab label={ts('obras.tabs.uploads')} />
          <Tab label={ts('obras.tabs.timeline')} />
          <Tab label={ts('attachments.tab')} disabled={!editing} />
          <Tab label={ts('workflow.pipeline')} disabled={!editing} />
          <Tab label={ts('bpe.aprovacoes')} disabled={!editing} />
          <Tab label={ts('technical.checklist.title')} disabled={!editing} />
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
                    label={ts('obras.fields.cliente')}
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message ? ts(fieldState.error.message) : undefined}
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
                    label={ts('obras.fields.responsavel')}
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message ? ts(fieldState.error.message) : undefined}
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
                    label={ts('obras.fields.projetoId')}
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message ? ts(fieldState.error.message) : undefined}
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
                    label={ts('obras.fields.projetoNome')}
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message ? ts(fieldState.error.message) : undefined}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="projetoTipo"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label={ts('obras.fields.tipoProjeto')} fullWidth>
                    {OBRAS_TIPO_OPTIONS.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type} - {ts(`engenharia.types.${type}`)}
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
                  <TextField {...field} type="date" label={ts('obras.fields.dataCriacao')} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Controller
                name="dataInicio"
                control={control}
                render={({ field }) => (
                  <TextField {...field} type="date" label={ts('obras.fields.dataInicio')} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Controller
                name="dataPrevista"
                control={control}
                render={({ field }) => (
                  <TextField {...field} type="date" label={ts('obras.fields.dataPrevista')} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Controller
                name="dataEntrega"
                control={control}
                render={({ field }) => (
                  <TextField {...field} type="date" label={ts('obras.fields.dataEntrega')} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="prioridade"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label={ts('obras.fields.prioridade')} fullWidth>
                    <MenuItem value="BAIXA">{ts('obras.priorities.BAIXA')}</MenuItem>
                    <MenuItem value="MEDIA">{ts('obras.priorities.MEDIA')}</MenuItem>
                    <MenuItem value="ALTA">{ts('obras.priorities.ALTA')}</MenuItem>
                    <MenuItem value="CRITICA">{ts('obras.priorities.CRITICA')}</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label={ts('obras.fields.status')} fullWidth>
                    {OBRAS_STATUS.map((status) => (
                      <MenuItem key={status} value={status}>
                        {ts(`obras.status.${status}`)}
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
                render={({ field }) => <TextField {...field} label={ts('obras.fields.observacoes')} multiline minRows={3} fullWidth />}
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
                  label={ts('obras.fields.equipesJson')}
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
                  label={ts('obras.fields.cronogramaJson')}
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
                  label={ts('obras.fields.diarioJson')}
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
                      label={ts('obras.fields.materiais')}
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
                      label={ts('obras.fields.equipamentos')}
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
                      label={ts('obras.fields.seguranca')}
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
                      label={ts('obras.fields.testes')}
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
                      label={ts('obras.fields.entrega')}
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
                  <TextField {...field} type="date" label={ts('obras.fields.data')} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Controller
                name="entregaTecnica.responsavel"
                control={control}
                render={({ field }) => <TextField {...field} label={ts('obras.fields.responsavel')} fullWidth />}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Controller
                name="entregaTecnica.assinatura"
                control={control}
                render={({ field }) => <TextField {...field} label={ts('obras.fields.assinatura')} fullWidth />}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 12 }}>
              <Controller
                name="entregaTecnica.observacoes"
                control={control}
                render={({ field }) => <TextField {...field} label={ts('obras.fields.observacoes')} multiline minRows={3} fullWidth />}
              />
            </Grid>
          </Grid>
        )}

        {tab === 5 && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <GlobalFileUpload title={ts('engenharia.uploads.fotos')} category="FOTO" files={watched.fotos} onUpload={async (files) => handleUpload('FOTO', files)} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <GlobalFileUpload title={ts('engenharia.uploads.videos')} category="VIDEO" files={watched.videos} onUpload={async (files) => handleUpload('VIDEO', files)} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <GlobalFileUpload title={ts('engenharia.uploads.pdfs')} category="PDF" files={watched.pdfs} onUpload={async (files) => handleUpload('PDF', files)} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <GlobalFileUpload
                title={ts('obras.fields.documentos')}
                category="OUTRO"
                files={watched.documentos}
                onUpload={async (files) => handleUpload('OUTRO', files)}
              />
            </Grid>
          </Grid>
        )}

        {tab === 6 && <ObrasTimeline events={editing?.timeline ?? []} />}

        {tab === 7 && (
          <ModuleAttachmentsTab
            entityId={editing?.id ?? ''}
            entityNome={editing?.clienteNome ?? ''}
            moduloContext="OBRAS"
            projetoId={editing?.projetoId}
          />
        )}

        {tab === 8 && editing && (
          <WorkflowPipelinePanel
            projetoId={editing.id}
            stepsStatus={stepsStatus}
            onChecklistChange={updateChecklist}
          />
        )}

        {tab === 9 && editing && (
          <ApprovalPanel
            projetoId={editing.id}
            codigoOficial={editing.codigoObra}
            clienteNome={editing.clienteNome}
            tiposRequeridos={['OBRAS', 'FINANCEIRO', 'GERENCIA']}
          />
        )}

        {tab === 10 && editing && (
          <UniversalChecklist
            title={ts('technical.checklist.title')}
            items={[
              { id: 'equipe', label: 'technical.checklist.obra.equipe', done: Boolean(editing.equipes), obrigatorio: true },
              { id: 'materiais', label: 'technical.checklist.obra.materiais', done: Boolean(editing.checklist?.materiais), obrigatorio: true },
              { id: 'seguranca', label: 'technical.checklist.obra.seguranca', done: Boolean(editing.checklist?.seguranca), obrigatorio: true },
              { id: 'testes', label: 'technical.checklist.obra.testes', done: Boolean(editing.checklist?.testes), obrigatorio: true },
              { id: 'assinatura', label: 'technical.checklist.obra.assinatura', done: Boolean(editing.entregaTecnica?.assinatura), obrigatorio: true },
              { id: 'fotos', label: 'technical.checklist.obra.fotosFinais', done: Boolean(editing.fotos?.length), obrigatorio: true },
              { id: 'documentos', label: 'technical.checklist.obra.documentos', done: Boolean(editing.documentos?.length), obrigatorio: false },
            ] as ChecklistItem[]}
            onChange={() => {
              AutomationService.notifyStatusChanged({
                entityId: editing.id,
                entityType: 'OBRA',
                statusAnterior: editing.status,
                statusNovo: editing.status,
                clienteNome: editing.clienteNome,
                codigoInterno: editing.codigoObra,
                timestamp: new Date().toISOString(),
              })
            }}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{ts('actions.cancel')}</Button>
        <Button variant="contained" disabled={loading} onClick={handleSubmit(onSubmit)}>
          {ts('actions.save')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
