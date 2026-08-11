/**
 * Painel de aprovações multi-nível para projetos
 */

import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import { BPEApprovalsEngine } from '@/shared/bpe/BPEApprovalsEngine'
import type { BPEApproval, BPEApprovalType } from '@/shared/bpe/BPETypes'
import { useAuth } from '@/auth/AuthContext'
import { useRBAC } from '@/shared/hooks/useRBAC'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

interface ApprovalPanelProps {
  projetoId: string
  codigoOficial: string
  clienteNome: string
  tiposRequeridos?: BPEApprovalType[]
  onAprovacaoChange?: () => void
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  PENDENTE: <HourglassEmptyIcon color="warning" fontSize="small" />,
  APROVADO: <CheckCircleIcon color="success" fontSize="small" />,
  REPROVADO: <CancelIcon color="error" fontSize="small" />,
  CANCELADO: <CancelIcon color="disabled" fontSize="small" />,
}

const DEFAULT_TIPOS: BPEApprovalType[] = ['ENGENHARIA', 'FINANCEIRO', 'GERENCIA', 'OBRAS', 'ASSISTENCIA']

export const ApprovalPanel = ({
  projetoId,
  codigoOficial,
  clienteNome,
  tiposRequeridos = DEFAULT_TIPOS,
  onAprovacaoChange,
}: ApprovalPanelProps) => {
  const ts = useTranslationService()
  const { user } = useAuth()
  const { role } = useRBAC()
  const [observacao, setObservacao] = useState('')
  const [responderTarget, setResponderTarget] = useState<BPEApproval | null>(null)

  const reload = () => onAprovacaoChange?.()

  const aprovacoes = BPEApprovalsEngine.listarPorProjeto(projetoId)

  const solicitadas = tiposRequeridos.map((tipo) => ({
    tipo,
    aprovacao: aprovacoes.find((a) => a.tipo === tipo) ?? null,
    status: BPEApprovalsEngine.getStatus(projetoId, tipo),
  }))

  const handleSolicitar = (tipo: BPEApprovalType) => {
    BPEApprovalsEngine.solicitar({
      projetoId,
      codigoOficial,
      clienteNome,
      tipo,
      solicitadoPor: user?.name ?? 'Sistema',
    })
    reload()
  }

  const handleResponder = async (aprovacao: BPEApproval, decisao: 'APROVADO' | 'REPROVADO') => {
    if (!user) return
    await BPEApprovalsEngine.responder({
      aprovacaoId: aprovacao.id,
      decisao,
      responsavelId: user.email ?? 'user',
      responsavelNome: user.name ?? 'Usuário',
      responsavelRole: role ?? 'ADMINISTRADOR',
      observacao,
    })
    setObservacao('')
    setResponderTarget(null)
    reload()
  }

  return (
    <Stack spacing={2} sx={{ pt: 1 }}>
      <Typography variant="h6">{ts('bpe.aprovacoes')}</Typography>

      <List disablePadding>
        {solicitadas.map(({ tipo, aprovacao, status }) => (
          <ListItem key={tipo} divider sx={{ py: 1, flexDirection: 'column', alignItems: 'flex-start' }}>
            <Stack direction="row" sx={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                {STATUS_ICON[status ?? 'PENDENTE'] ?? <HourglassEmptyIcon color="disabled" fontSize="small" />}
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {ts(`bpe.aprovacaoTipo.${tipo}`)}
                </Typography>
                {status && (
                  <Chip
                    label={ts(`bpe.${status.toLowerCase()}`)}
                    size="small"
                    color={status === 'APROVADO' ? 'success' : status === 'REPROVADO' ? 'error' : 'warning'}
                    variant="outlined"
                  />
                )}
              </Stack>

              <Stack direction="row" spacing={0.5}>
                {!aprovacao && (
                  <Button size="small" variant="outlined" onClick={() => handleSolicitar(tipo)}>
                    {ts('bpe.solicitarAprovacao')}
                  </Button>
                )}
                {aprovacao?.status === 'PENDENTE' && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={() => setResponderTarget(aprovacao)}
                  >
                    {ts('bpe.aprovar')} / {ts('bpe.reprovar')}
                  </Button>
                )}
              </Stack>
            </Stack>

            {aprovacao && (
              <Box sx={{ pl: 3.5, mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {ts('bpe.solicitadoEm')}: {new Date(aprovacao.solicitadoEm).toLocaleString()}
                  {aprovacao.respondidoEm && ` | ${ts('bpe.respondidoEm')}: ${new Date(aprovacao.respondidoEm).toLocaleString()}`}
                  {aprovacao.responsavelNome && ` | ${ts('bpe.responsavel')}: ${aprovacao.responsavelNome}`}
                </Typography>
                {aprovacao.observacao && (
                  <Typography variant="caption" color="text.secondary">
                    {' | '}{ts('bpe.observacao')}: {aprovacao.observacao}
                  </Typography>
                )}
              </Box>
            )}

            {/* Formulário de resposta inline */}
            {responderTarget?.id === aprovacao?.id && (
              <Box sx={{ mt: 1, width: '100%', pl: 3.5 }}>
                <Divider sx={{ mb: 1 }} />
                <Stack spacing={1}>
                  <TextField
                    size="small"
                    fullWidth
                    label={ts('bpe.observacao')}
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    multiline
                    rows={2}
                  />
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleResponder(aprovacao!, 'APROVADO')}
                    >
                      {ts('bpe.aprovar')}
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<CancelIcon />}
                      onClick={() => handleResponder(aprovacao!, 'REPROVADO')}
                    >
                      {ts('bpe.reprovar')}
                    </Button>
                    <Button size="small" onClick={() => setResponderTarget(null)}>
                      {ts('actions.cancel')}
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            )}
          </ListItem>
        ))}
      </List>

      {solicitadas.every((s) => s.status === 'APROVADO') && (
        <Alert severity="success">Todas as aprovações concedidas.</Alert>
      )}
    </Stack>
  )
}
