import { Box, Grid, Stack, TextField, Typography } from '@mui/material'
import { Controller, type Control, type FieldErrors } from 'react-hook-form'
import { IMOTO_SEGMENT_QUESTIONS } from '@/modules/imoto/models/imotoModels'
import type { ImotoLevantamentoForm, ImotoSegment } from '@/modules/imoto/types/imotoTypes'
import { useTranslationService } from '@/shared/hooks/useTranslationService'
import modeloCabine from '@/modules/imoto/assets/transportadores/modelo-cabine.png'
import larguraChassi from '@/modules/imoto/assets/transportadores/largura-chassi.png'
import configuracaoVeiculo from '@/modules/imoto/assets/transportadores/configuracao-veiculo.png'
import dimensoesEntreEixos from '@/modules/imoto/assets/transportadores/dimensoes-entre-eixos.png'
import dimensoesQuartoEixo from '@/modules/imoto/assets/transportadores/dimensoes-quarto-eixo.png'
import dimensoesCaixas from '@/modules/imoto/assets/transportadores/dimensoes-caixas.png'
import materialTransportado from '@/modules/imoto/assets/transportadores/material-transportado.png'

const QUESTION_ILLUSTRATIONS: Record<string, string[]> = {
  tipoCabine: [modeloCabine],
  larguraChassi: [larguraChassi],
  configuracaoVeiculo: [configuracaoVeiculo],
  dimensoesEntreEixos: [dimensoesEntreEixos, dimensoesQuartoEixo],
  numeroCaixas: [dimensoesCaixas],
  formaMaterialTransportado: [materialTransportado],
}

type ImotoSegmentFormProps = {
  segment: ImotoSegment
  control: Control<ImotoLevantamentoForm>
  errors: FieldErrors<ImotoLevantamentoForm>
}

export const ImotoSegmentForm = ({ segment, control, errors }: ImotoSegmentFormProps) => {
  const ts = useTranslationService()
  const questions = IMOTO_SEGMENT_QUESTIONS[segment]

  return (
    <Grid container spacing={2}>
      {questions.map((question) => {
        const illustrations = QUESTION_ILLUSTRATIONS[question.key]
        return (
          <Grid key={question.key} size={{ xs: 12, md: illustrations ? 12 : 6 }}>
            {illustrations && (
              <Stack spacing={1} sx={{ mb: 1.5 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {ts(`imoto.questions.${question.key}`)}
                </Typography>
                {illustrations.map((source, index) => (
                  <Box
                    key={source}
                    component="img"
                    src={source}
                    alt={`${ts(`imoto.questions.${question.key}`)} ${index + 1}`}
                    sx={{
                      width: '100%',
                      maxHeight: 520,
                      objectFit: 'contain',
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  />
                ))}
              </Stack>
            )}
            <Controller
              name={`questionnaire.${question.key}`}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={ts(`imoto.questions.${question.key}`)}
                  fullWidth
                  error={Boolean(errors.questionnaire?.[question.key])}
                  helperText={
                    errors.questionnaire?.[question.key]?.message
                      ? ts(errors.questionnaire[question.key]?.message as string)
                      : undefined
                  }
                />
              )}
            />
          </Grid>
        )
      })}
    </Grid>
  )
}
