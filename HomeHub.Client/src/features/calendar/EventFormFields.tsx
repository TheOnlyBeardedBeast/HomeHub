import * as stylex from '@stylexjs/stylex';
import { FormError } from '../../components/ui/FormError';
import type { AppFormApi } from '../../components/ui/formApi';
import { FormRow } from '../../components/ui/FormRow';
import { RecurrenceEditor } from '../../components/ui/RecurrenceEditor';
import { SelectField } from '../../components/ui/SelectField';
import { SwitchField } from '../../components/ui/SwitchField';
import { TextAreaField } from '../../components/ui/TextAreaField';
import { TextField } from '../../components/ui/TextField';
import { categories } from '../../lib/categories';
import { fromDateInput, toDateInput } from '../../lib/format';
import { space } from '../../styles/tokens.stylex';
import { timePattern, type EventFormValues } from './eventForm';

const styles = stylex.create({
  form: { display: 'flex', flexDirection: 'column', gap: space.s4 },
});

export function EventFormFields({
  form,
  serverError,
  onSubmit,
}: {
  form: AppFormApi<EventFormValues>;
  serverError: string | null;
  onSubmit: () => void;
}) {
  return (
    <form
      id="event-form"
      {...stylex.props(styles.form)}
      onSubmit={(submitEvent) => {
        submitEvent.preventDefault();
        submitEvent.stopPropagation();
        onSubmit();
      }}
    >
      {serverError && <FormError message={serverError} />}

      <form.Field
        name="title"
        validators={{
          onSubmit: ({ value }) => (value.trim() ? undefined : 'Give the event a name.'),
        }}
      >
        {(field) => (
          <TextField
            field={field}
            label="Event"
            placeholder="Dentist, football practice, dinner with the neighbours…"
            autoFocus
          />
        )}
      </form.Field>

      <FormRow>
        <form.Field
          name="date"
          validators={{
            onSubmit: ({ value }) => (value ? undefined : 'Pick a date.'),
          }}
        >
          {(field) => <TextField field={field} label="Date" type="date" />}
        </form.Field>
        <form.Field name="category">
          {(field) => (
            <SelectField
              field={field}
              label="Category"
              options={categories.map((category) => ({
                value: category.value,
                label: category.label,
              }))}
            />
          )}
        </form.Field>
      </FormRow>

      <form.Field name="allDay">
        {(field) => (
          <SwitchField
            field={field}
            label="All day"
            hint="Hide the times and mark the whole day."
          />
        )}
      </form.Field>

      <form.Subscribe selector={(state) => state.values.allDay}>
        {(allDay) =>
          allDay ? null : (
            <FormRow>
              <form.Field
                name="startTime"
                validators={{
                  onSubmit: ({ value }) =>
                    timePattern.test(value) ? undefined : 'Use 24-hour time, like 09:00.',
                }}
              >
                {(field) => (
                  <TextField
                    field={field}
                    label="Starts"
                    placeholder="HH:mm"
                    maxLength={5}
                    autoComplete="off"
                  />
                )}
              </form.Field>
              <form.Field
                name="endTime"
                validators={{
                  onSubmit: ({ value }) =>
                    !value || timePattern.test(value) ? undefined : 'Use 24-hour time, like 17:30.',
                }}
              >
                {(field) => (
                  <TextField
                    field={field}
                    label="Ends"
                    optional
                    placeholder="HH:mm"
                    maxLength={5}
                    autoComplete="off"
                    hint="24-hour. Defaults to one hour."
                  />
                )}
              </form.Field>
            </FormRow>
          )
        }
      </form.Subscribe>

      <form.Subscribe selector={(state) => state.values.date}>
        {(date) => (
          <form.Field name="recurrence">
            {(field) => (
              <RecurrenceEditor
                value={field.state.value}
                onChange={(next) => field.handleChange(next)}
                anchor={fromDateInput(date || toDateInput(new Date()))}
                allowNone
              />
            )}
          </form.Field>
        )}
      </form.Subscribe>

      <form.Field name="description">
        {(field) => (
          <TextAreaField
            field={field}
            label="Notes"
            optional
            placeholder="Anything the household should know."
            rows={4}
          />
        )}
      </form.Field>
    </form>
  );
}
