import { useForm } from '@tanstack/react-form';
import * as stylex from '@stylexjs/stylex';
import { useCallback, useMemo, useState } from 'react';
import { useSaveRecurringTask } from '../../api/hooks/useSaveRecurringTask';
import { Button } from '../../components/ui/Button';
import { ConflictNotice } from '../../components/ui/ConflictNotice';
import { Dialog } from '../../components/ui/Dialog';
import type { RecurringTask } from '../../gen/tasks_pb';
import { errorMessage, isConcurrencyConflict } from '../../lib/errors';
import { toDate } from '../../lib/format';
import { usePeople } from '../../lib/people';
import {
  defaultRecurrence,
  recurrenceError,
  recurrenceFromRRule,
  recurrenceToRRule,
  type RecurrenceDraft,
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

function RecurringTaskConflict({
  conflict,
  busy,
  onOverwrite,
  onDiscard,
}: {
  conflict: boolean;
  busy: boolean;
  onOverwrite: () => void;
  onDiscard: () => void;
}) {
  if (!conflict) return null;
  return (
    <ConflictNotice
      message="This repeating task changed on another device while you were editing."
      busy={busy}
      onOverwrite={onOverwrite}
      onDiscard={onDiscard}
    />
  );
}

interface RecurringFormValues {
  title: string;
  description: string;
  assignedTo: string;
  recurrence: RecurrenceDraft;
}

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
  const [conflict, setConflict] = useState(false);
  const anchor = useMemo(
    () => toDate(recurringTask?.createdAt) ?? new Date(),
    [recurringTask?.createdAt],
  );
  const initialRecurrence = recurringTask
    ? recurrenceFromRRule(recurringTask.rrule, anchor, 'weekly')
    : defaultRecurrence(anchor, 'weekly');

  const persist = useCallback(
    async (force: boolean, value: RecurringFormValues) => {
      setServerError(null);
      setConflict(false);
      if (!value.title.trim()) return;

      const rule = recurrenceToRRule(value.recurrence, anchor);
      const recurrenceProblem =
        recurrenceError(value.recurrence) ??
        (rule ? undefined : 'Choose how often this task repeats.');
      if (recurrenceProblem) {
        setServerError(recurrenceProblem);
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
          version: recurringTask?.version,
          force,
        });
        toast(recurringTask ? 'Repeating task updated.' : 'Repeating task added.', 'success');
        onClose();
      } catch (error) {
        if (isConcurrencyConflict(error)) {
          setConflict(true);
          return;
        }
        setServerError(errorMessage(error));
      }
    },
    [anchor, onClose, recurringTask, save],
  );

  const form = useForm({
    defaultValues: {
      title: recurringTask?.title ?? '',
      description: recurringTask?.description ?? '',
      assignedTo: recurringTask?.assignedTo ?? '',
      recurrence: initialRecurrence,
    },
    onSubmit: async ({ value }) => {
      await persist(false, value);
    },
  });

  const overwrite = useCallback(() => {
    void persist(true, form.state.values);
  }, [form.state.values, persist]);

  const discard = useCallback(() => {
    setConflict(false);
    onClose();
  }, [onClose]);

  const notice = (
    <RecurringTaskConflict
      conflict={conflict}
      busy={save.isPending}
      onOverwrite={overwrite}
      onDiscard={discard}
    />
  );

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
        notice={notice}
      />
    </Dialog>
  );
}
