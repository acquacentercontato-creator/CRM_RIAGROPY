import { Grid, TextField } from '@mui/material'
import { Controller, type Control, type FieldErrors } from 'react-hook-form'
import { IMOTO_SEGMENT_QUESTIONS } from '@/modules/imoto/models/imotoModels'
import type { ImotoLevantamentoForm, ImotoSegment } from '@/modules/imoto/types/imotoTypes'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

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
      {questions.map((question) => (
        <Grid key={question.key} size={{ xs: 12, md: 6 }}>
          <Controller
            name={`questionnaire.${question.key}`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={ts(`imoto.questions.${question.key}`)}
                fullWidth
                error={Boolean(errors.questionnaire?.[question.key])}
                helperText={errors.questionnaire?.[question.key]?.message ? ts(errors.questionnaire[question.key]?.message as string) : undefined}
              />
            )}
          />
        </Grid>
      ))}
    </Grid>
  )
}
