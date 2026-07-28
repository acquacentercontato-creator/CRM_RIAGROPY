import { Grid, TextField } from '@mui/material'
import { Controller, type Control, type FieldErrors } from 'react-hook-form'
import { IMOTO_SEGMENT_QUESTIONS } from '@/modules/imoto/models/imotoModels'
import type { ImotoLevantamentoForm, ImotoSegment } from '@/modules/imoto/types/imotoTypes'

type ImotoSegmentFormProps = {
  segment: ImotoSegment
  control: Control<ImotoLevantamentoForm>
  errors: FieldErrors<ImotoLevantamentoForm>
}

export const ImotoSegmentForm = ({ segment, control, errors }: ImotoSegmentFormProps) => {
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
                label={question.label}
                fullWidth
                error={Boolean(errors.questionnaire?.[question.key])}
                helperText={errors.questionnaire?.[question.key]?.message}
              />
            )}
          />
        </Grid>
      ))}
    </Grid>
  )
}
