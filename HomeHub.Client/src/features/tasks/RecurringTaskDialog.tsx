import { useForm } from '@tanstack/react-form';
import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';
import { useSaveRecurringTask } from '../../api/hooks/useSaveRecurringTask';
import { Button } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';
import type { RecurringTask } from '../../gen/tasks_pb';
import { errorMessage } from '../../lib/errors';
import { toDate } from '../../lib/format';
import { usePeople } from '../../lib/people';
import {
  defaultRecurrence,
  recurrenceError,
  recurrenceFromRRule,
  recurrenceToRRule,
} from '../../lib/rrules';
import { toast } from '../../lib/toasts';
import { RecurringTaskFormFields } from './RecurringTaskFormFields';

const styles = stylex.create({
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '8px',
    width: '100%',
  },
});

export function RecurringTaskDialog({
  recurringTask,
  onClose,
}: {
  recurringTask?: RecurringTask;
  onClose: () => void;
}) {
  const save = useSaveRecurringTask();
  const { assigneeOptions } = usePeople();
  const [serverError, setServerError] = useState<string | null>(null);
  const anchor = toDate(recurringTask?.createdAt) ?? new Date();
  const initialRecurrence = recurringTask
    ? recurrenceFromRRule(recurringTask.rrule, anchor, 'weekly')
    : defaultRecurrence(anchor, 'weekly');

  const form = useForm({
    defaultValues: {
      title: recurringTask?.title ?? '',
      description: recurringTask?.description ?? '',
      assignedTo: recurringTask?.assignedTo ?? '',
      recurrence: initialRecurrence,
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      if (!value.title.trim()) return;

      const recurrenceProblem = recurrenceError(value.recurrence);
      if (recurrenceProblem) {
        setServerError(recurrenceProblem);
        return;
      }

      const rule = recurrenceToRRule(value.recurrence, anchor);
      if (!rule) {
        setServerError('Choose how often this task repeats.');
        return;
      }

      try {
        await save.mutateAsync({
          id: recurringTask?.id,
          title: value.title,
          description: value.description,
          assignedTo: value.assignedTo || undefined,
          rrule: rule,
          createdAt: toDate(recurringTask?.createdAt),
        });
        toast(recurringTask ? 'Repeating task updated.' : 'Repeating task added.', 'success');
        onClose();
      } catch (error) {
        setServerError(errorMessage(error));
      }
    },
  });

  return (
    <Dialog
      open
      onClose={onClose}
      title={recurringTask ? 'Edit repeating task' : 'New repeating task'}
      description="A chore that comes back on its own — it appears on the day, already waiting."
      footer={
        <div {...stylex.props(styles.footer)}>
          <Button variant="ghost" onClick={onClose} disabled={save.isPending}>
            Cancel
          </Button>
          <Button loading={save.isPending} onClick={() => form.handleSubmit()}>
            {recurringTask ? 'Save changes' : 'Add repeating task'}
          </Button>
        </div>
      }
    >
      <RecurringTaskFormFields
        form={form}
        assigneeOptions={assigneeOptions}
        anchor={anchor}
        serverError={serverError}
      />
    </Dialog>
  );
}
