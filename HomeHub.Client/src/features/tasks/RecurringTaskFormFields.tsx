import * as stylex from '@stylexjs/stylex';
import { FormError } from '../../components/ui/FormError';
import type { AppFormApi } from '../../components/ui/formApi';
import { RecurrenceEditor } from '../../components/ui/RecurrenceEditor';
import { SelectField } from '../../components/ui/SelectField';
import { TextAreaField } from '../../components/ui/TextAreaField';
import { TextField } from '../../components/ui/TextField';
import type { RecurrenceDraft } from '../../lib/rrules';
import { space } from '../../styles/tokens.stylex';

const styles = stylex.create({
  form: { display: 'flex', flexDirection: 'column', gap: space.s4 },
});

interface RecurringFormValues {
  title: string;
  description: string;
  assignedTo: string;
  recurrence: RecurrenceDraft;
}

export function RecurringTaskFormFields({
  form,
  assigneeOptions,
  anchor,
  serverError,
}: {
  form: AppFormApi<RecurringFormValues>;
  assigneeOptions: { value: string; label: string }[];
  anchor: Date;
  serverError: string | null;
}) {
  return (
    <form
      {...stylex.props(styles.form)}
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
    >
      {serverError && <FormError message={serverError} />}

      <form.Field
        name="title"
        validators={{
          onSubmit: ({ value }) => (value.trim() ? undefined : 'Give the task a name.'),
        }}
      >
        {(field) => (
          <TextField
            field={field}
            label="Task"
            placeholder="Water the plants, empty the dishwasher…"
            autoFocus
          />
        )}
      </form.Field>

      <form.Field name="assignedTo">
        {(field) => <SelectField field={field} label="Assigned to" options={assigneeOptions} />}
      </form.Field>

      <form.Field name="recurrence">
        {(field) => (
          <RecurrenceEditor
            value={field.state.value}
            onChange={(next) => field.handleChange(next)}
            anchor={anchor}
            allowNone={false}
          />
        )}
      </form.Field>

      <form.Field name="description">
        {(field) => (
          <TextAreaField
            field={field}
            label="Notes"
            optional
            placeholder="Anything worth remembering when this comes around."
            rows={3}
          />
        )}
      </form.Field>
    </form>
  );
}
