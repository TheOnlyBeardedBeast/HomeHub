import * as stylex from '@stylexjs/stylex';
import { FormError } from '../../components/ui/FormError';
import type { AppFormApi } from '../../components/ui/formApi';
import { SelectField } from '../../components/ui/SelectField';
import { SwitchField } from '../../components/ui/SwitchField';
import { TextAreaField } from '../../components/ui/TextAreaField';
import { TextField } from '../../components/ui/TextField';
import { space } from '../../styles/tokens.stylex';

const styles = stylex.create({
  form: { display: 'flex', flexDirection: 'column', gap: space.s4 },
});

interface TaskFormValues {
  title: string;
  description: string;
  assignedTo: string;
  done: boolean;
}

export function TaskFormFields({
  form,
  assigneeOptions,
  serverError,
}: {
  form: AppFormApi<TaskFormValues>;
  assigneeOptions: { value: string; label: string }[];
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
            placeholder="Take the recycling out, book the boiler service…"
            autoFocus
          />
        )}
      </form.Field>

      <form.Field name="assignedTo">
        {(field) => <SelectField field={field} label="Assigned to" options={assigneeOptions} />}
      </form.Field>

      <form.Field name="description">
        {(field) => (
          <TextAreaField
            field={field}
            label="Notes"
            optional
            placeholder="Any details worth keeping with the task."
            rows={3}
          />
        )}
      </form.Field>

      <form.Field name="done">
        {(field) => (
          <SwitchField field={field} label="Already done" hint="Mark it complete straight away." />
        )}
      </form.Field>
    </form>
  );
}
