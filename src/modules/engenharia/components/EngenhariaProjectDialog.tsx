import { zodResolver } from '@hookform/resolvers/zod'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { GlobalFileUpload } from '@/shared/components/GlobalFileUpload'
import { useTranslationService } from '@/shared/hooks/useTranslationService'
import { ENGENHARIA_TYPE_OPTIONS } from '@/modules/engenharia/models/engenhariaModels'
import { useEngenhariaDraft } from '@/modules/engenharia/hooks/useEngenhariaDraft'
import { EngenhariaService } from '@/modules/engenharia/services/EngenhariaService'
import type {
  EngenhariaProject,
  EngenhariaProjectForm,
  EngenhariaUploadCategory,
} from '@/modules/engenharia/types/engenhariaTypes'
import { ENGENHARIA_STATUS } from '@/modules/engenharia/types/engenhariaTypes'
import { createEmptyProjectForm } from '@/modules/engenharia/utils/engenhariaUtils'
import { engenhariaProjectSchema } from '@/modules/engenharia/validators/engenhariaValidators'
import { EngenhariaTimeline } from '@/modules/engenharia/components/EngenhariaTimeline'
import { ModuleAttachmentsTab } from '@/shared/attachments'
import { WorkflowPipelinePanel } from '@/shared/workflow/pipeline/components/WorkflowPipelinePanel'
import { useWorkflowPipeline } from '@/shared/workflow/pipeline/hooks/useWorkflowPipeline'
import { ApprovalPanel } from '@/shared/bpe/components/ApprovalPanel'
import { UniversalChecklist, type ChecklistItem } from '@/shared/components/UniversalChecklist'
import { AutomationService } from '@/shared/crm-automation'

type EngenhariaProjectDialogProps = {
  open: boolean
  editing: EngenhariaProject | null
  loading: boolean
  onClose: () => void
  onSubmit: (payload: EngenhariaProjectForm) => Promise<void>
  onUpload: (id: string, category: EngenhariaUploadCategory, files: File[]) => Promise<EngenhariaProject>
  onSaveMemorial: (id: string, memorial: string) => Promise<void>
  onApproval: (
    id: string,
    decision: 'APROVAR' | 'SOLICITAR_REVISAO',
    observacao: string
  ) => Promise<void>
}

export const EngenhariaProjectDialog = ({
  open,
  editing,
  loading,
  onClose,
  onSubmit,
  onUpload,
  onSaveMemorial,
  onApproval,
}: EngenhariaProjectDialogProps) => {
  const ts = useTranslationService()
  const [tab, setTab] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [approvalNote, setApprovalNote] = useState('')

  const pipelineId = editing?.id ?? '__novo__'
  const { stepsStatus, updateChecklist } = useWorkflowPipeline(
    pipelineId,
    editing?.codigoProjeto ?? '',
    editing?.clienteNome ?? ''
  )

  const initial = useMemo<EngenhariaProjectForm>(() => {
    if (editing) {
      return {
        clienteNome: editing.clienteNome,
        titulo: editing.titulo,
        tipoProjeto: editing.tipoProjeto,
        origem: editing.origem,
        status: editing.status,
        memorialDescritivo: editing.memorialDescritivo,
        observacoes: editing.observacoes,
        plantaPdf: editing.plantaPdf,
        dwg: editing.dwg,
        dxf: editing.dxf,
        kmz: editing.kmz,
        fotos: editing.fotos,
        videos: editing.videos,
        materiais: editing.materiais,
      }
    }

    const draft = EngenhariaService.loadDraft()
    return draft ?? createEmptyProjectForm()
  }, [editing])

  const { control, reset, setValue, handleSubmit } = useForm<EngenhariaProjectForm>({
    resolver: zodResolver(engenhariaProjectSchema),
    defaultValues: initial,
  })

  const watchedValues = useWatch({ control }) as EngenhariaProjectForm
  useEngenhariaDraft(watchedValues, open && !editing)

  useEffect(() => {
    if (open) {
      reset(initial)
    }
  }, [open, initial, reset])

  const handleUpload = async (category: EngenhariaUploadCategory, files: File[]) => {
    if (!editing) {
      setFeedback(ts('engenharia.feedback.saveBeforeUpload'))
      return
    }

    const updated = await onUpload(editing.id, category, files)
    setValue('plantaPdf', updated.plantaPdf)
    setValue('dwg', updated.dwg)
    setValue('dxf', updated.dxf)
    setValue('kmz', updated.kmz)
    setValue('fotos', updated.fotos)
    setValue('videos', updated.videos)
    setValue('materiais', updated.materiais)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>{editing ? ts('engenharia.projectCode', { codigo: editing.codigoProjeto }) : ts('engenharia.newProject')}</DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 2 }}>
          <Tab label={ts('engenharia.tabs.dados')} />
          <Tab label={ts('engenharia.tabs.arquivos')} />
          <Tab label={ts('engenharia.tabs.memorial')} />
          <Tab label={ts('engenharia.tabs.timeline')} />
          <Tab label={ts('engenharia.tabs.aprovacao')} />
          <Tab label={ts('attachments.tab')} disabled={!editing} />
          <Tab label={ts('workflow.pipeline')} disabled={!editing} />
          <Tab label={ts('bpe.aprovacoes')} disabled={!editing} />
          <Tab label={ts('technical.checklist.title')} disabled={!editing} />
        </Tabs>

        {feedback && <Alert severity="info" sx={{ mb: 2 }}>{feedback}</Alert>}

        {tab === 0 && (
          <Stack spacing={2}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="clienteNome"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label={ts('engenharia.fields.cliente')}
                      fullWidth
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message ? ts(fieldState.error.message) : undefined}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="titulo"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label={ts('engenharia.fields.tituloProjeto')}
                      fullWidth
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message ? ts(fieldState.error.message) : undefined}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="tipoProjeto"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label={ts('engenharia.fields.tipo')} fullWidth>
                      {ENGENHARIA_TYPE_OPTIONS.map((typeCode) => (
                        <MenuItem key={typeCode} value={typeCode}>
                          {typeCode} - {ts(`engenharia.types.${typeCode}`)}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="origem"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label={ts('engenharia.fields.origem')} fullWidth>
                      <MenuItem value="RIEGO">{ts('engenharia.origins.RIEGO')}</MenuItem>
                      <MenuItem value="IMOTO">{ts('engenharia.origins.IMOTO')}</MenuItem>
                      <MenuItem value="OUTRO">{ts('engenharia.origins.OUTRO')}</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label={ts('engenharia.fields.status')} fullWidth>
                      {ENGENHARIA_STATUS.map((status) => (
                        <MenuItem key={status} value={status}>
                          {ts(`engenharia.status.${status}`)}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
            </Grid>

            <Controller
              name="observacoes"
              control={control}
              render={({ field }) => <TextField {...field} label={ts('engenharia.fields.observacoes')} multiline minRows={3} fullWidth />}
            />
          </Stack>
        )}

        {tab === 1 && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <GlobalFileUpload
                title={ts('engenharia.uploads.plantaPdf')}
                category="PDF"
                files={watchedValues.plantaPdf}
                onUpload={async (files) => handleUpload('PDF', files)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <GlobalFileUpload
                title={ts('engenharia.uploads.dwg')}
                category="DWG"
                files={watchedValues.dwg}
                onUpload={async (files) => handleUpload('DWG', files)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <GlobalFileUpload
                title={ts('engenharia.uploads.dxf')}
                category="DXF"
                files={watchedValues.dxf}
                onUpload={async (files) => handleUpload('DXF', files)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <GlobalFileUpload
                title={ts('engenharia.uploads.kmz')}
                category="KMZ"
                files={watchedValues.kmz}
                onUpload={async (files) => handleUpload('KMZ', files)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <GlobalFileUpload
                title={ts('engenharia.uploads.fotos')}
                category="FOTO"
                files={watchedValues.fotos}
                onUpload={async (files) => handleUpload('FOTO', files)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <GlobalFileUpload
                title={ts('engenharia.uploads.videos')}
                category="VIDEO"
                files={watchedValues.videos}
                onUpload={async (files) => handleUpload('VIDEO', files)}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <GlobalFileUpload
                title={ts('engenharia.uploads.materiais')}
                category="OUTRO"
                files={watchedValues.materiais}
                onUpload={async (files) => handleUpload('OUTRO', files)}
              />
            </Grid>
          </Grid>
        )}

        {tab === 2 && (
          <Stack spacing={2}>
            <Controller
              name="memorialDescritivo"
              control={control}
              render={({ field }) => (
                <TextField {...field} label={ts('engenharia.fields.memorial')} multiline minRows={8} fullWidth />
              )}
            />
            {editing && (
              <Button
                variant="outlined"
                onClick={async () => {
                  await onSaveMemorial(editing.id, watchedValues.memorialDescritivo)
                  setFeedback(ts('engenharia.feedback.memorialUpdated'))
                }}
              >
                {ts('engenharia.actions.updateMemorial')}
              </Button>
            )}
          </Stack>
        )}

        {tab === 3 && <EngenhariaTimeline events={editing?.timeline ?? []} />}

        {tab === 4 && (
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              {ts('engenharia.approvalInfo')}
            </Typography>
            <TextField
              label={ts('engenharia.fields.observacao')}
              value={approvalNote}
              onChange={(event) => setApprovalNote(event.target.value)}
              multiline
              minRows={3}
              fullWidth
            />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
              <Button
                variant="contained"
                disabled={!editing}
                onClick={async () => {
                  if (!editing) return
                  await onApproval(editing.id, 'APROVAR', approvalNote)
                  setFeedback(ts('engenharia.feedback.approved'))
                }}
              >
                {ts('engenharia.actions.approve')}
              </Button>
              <Button
                variant="outlined"
                color="warning"
                disabled={!editing}
                onClick={async () => {
                  if (!editing) return
                  await onApproval(editing.id, 'SOLICITAR_REVISAO', approvalNote)
                  setFeedback(ts('engenharia.feedback.revisionRequested'))
                }}
              >
                {ts('engenharia.actions.requestRevision')}
              </Button>
            </Stack>
          </Stack>
        )}

        {tab === 5 && (
          <ModuleAttachmentsTab
            entityId={editing?.id ?? ''}
            entityNome={editing?.clienteNome ?? ''}
            moduloContext="ENGENHARIA"
            projetoId={editing?.id}
          />
        )}

        {tab === 6 && editing && (
          <WorkflowPipelinePanel
            projetoId={editing.id}
            stepsStatus={stepsStatus}
            onChecklistChange={updateChecklist}
          />
        )}

        {tab === 7 && editing && (
          <ApprovalPanel
            projetoId={editing.id}
            codigoOficial={editing.codigoProjeto}
            clienteNome={editing.clienteNome}
            tiposRequeridos={['ENGENHARIA', 'GERENCIA']}
          />
        )}

        {tab === 8 && editing && (
          <UniversalChecklist
            title={ts('technical.checklist.title')}
            items={[
              { id: 'levantamento', label: 'technical.checklist.eng.levantamento', done: editing.status !== 'AGUARDANDO ENGENHARIA', obrigatorio: true },
              { id: 'planta', label: 'technical.checklist.eng.planta', done: Boolean(editing.plantaPdf?.length), obrigatorio: true },
              { id: 'dwg', label: 'technical.checklist.eng.dwg', done: Boolean(editing.dwg?.length), obrigatorio: false },
              { id: 'dxf', label: 'technical.checklist.eng.dxf', done: Boolean(editing.dxf?.length), obrigatorio: false },
              { id: 'kmz', label: 'technical.checklist.eng.kmz', done: Boolean(editing.kmz?.length), obrigatorio: false },
              { id: 'memorial', label: 'technical.checklist.eng.memorial', done: Boolean(editing.memorialDescritivo), obrigatorio: true },
              { id: 'materiais', label: 'technical.checklist.eng.materiais', done: Boolean(editing.materiais?.length), obrigatorio: true },
              { id: 'aprovacao', label: 'technical.checklist.eng.aprovacaoGerente', done: editing.aprovadoGerente === 'APROVADO', obrigatorio: true },
            ] as ChecklistItem[]}
            onChange={() => {
              AutomationService.notifyStatusChanged({
                entityId: editing.id,
                entityType: 'PROJETO',
                statusAnterior: editing.status,
                statusNovo: editing.status,
                clienteNome: editing.clienteNome,
                codigoInterno: editing.codigoProjeto,
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
