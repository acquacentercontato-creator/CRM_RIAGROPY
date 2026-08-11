import { Grid, TextField } from '@mui/material'
import { Controller, type Control, type FieldErrors } from 'react-hook-form'
import { RIEGO_SEGMENT_QUESTIONS } from '@/modules/riego/models/riegoModels'
import type { RiegoLevantamentoForm, RiegoSegment } from '@/modules/riego/types/riegoTypes'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

type RiegoSegmentFormProps = {
  segment: RiegoSegment
  control: Control<RiegoLevantamentoForm>
  errors: FieldErrors<RiegoLevantamentoForm>
}

export const RiegoSegmentForm = ({ segment, control, errors }: RiegoSegmentFormProps) => {
  const ts = useTranslationService()
  const questions = RIEGO_SEGMENT_QUESTIONS[segment]

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
                label={ts(`riego.questions.${question.key}`)}
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
