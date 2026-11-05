import { useForm } from '@tanstack/react-form';
import * as stylex from '@stylexjs/stylex';
import { useCallback, useState } from 'react';
import { useCreateTask } from '../../api/hooks/useCreateTask';
import type { TaskMessage } from '../../api/hooks/useTasks';
import { useUpdateTask } from '../../api/hooks/useUpdateTask';
import { Button } from '../../components/ui/Button';
import { ConflictNotice } from '../../components/ui/ConflictNotice';
import { Dialog } from '../../components/ui/Dialog';
import { errorMessage, isConcurrencyConflict } from '../../lib/errors';
import { usePeople } from '../../lib/people';
import { toast } from '../../lib/toasts';
import { TaskFormFields } from './TaskFormFields';
import {
  taskDefaults,
  taskDialogDescription,
  taskDialogTitle,
  taskSubmitLabel,
} from './taskDialogCopy';

const styles = stylex.create({
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '8px',
    width: '100%',
  },
});

interface TaskFormValues {
  title: string;
  description: string;
  assignedTo: string;
  done: boolean;
}

export function TaskDialog({ task, onClose }: { task?: TaskMessage; onClose: () => void }) {
  const create = useCreateTask();
  const update = useUpdateTask();
  const { assigneeOptions } = usePeople();
  const [serverError, setServerError] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);

  const persist = useCallback(
    async (force: boolean, value: TaskFormValues) => {
      setServerError(null);
      setConflict(false);
      if (!value.title.trim()) return;
      try {
        if (task) {
          await update.mutateAsync({
            task: {
              ...task,
              title: value.title.trim(),
              description: value.description.trim() || undefined,
              assignedTo: value.assignedTo || undefined,
              done: value.done,
            },
            force,
          });
          toast('Task updated.', 'success');
        } else {
          await create.mutateAsync({
            title: value.title,
            description: value.description,
            assignedTo: value.assignedTo || undefined,
            done: value.done,
          });
          toast('Task added.', 'success');
        }
        onClose();
      } catch (error) {
        if (isConcurrencyConflict(error)) {
          setConflict(true);
          return;
        }
        setServerError(errorMessage(error));
      }
    },
    [create, onClose, task, update],
  );

  const form = useForm({
    defaultValues: taskDefaults(task),
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

  const busy = create.isPending || update.isPending;
  const notice = conflict ? (
    <ConflictNotice
      message="This task changed on another device while you were editing."
      busy={busy}
      onOverwrite={overwrite}
      onDiscard={discard}
    />
  ) : undefined;

  return (
    <Dialog
      open
      onClose={onClose}
      title={taskDialogTitle(task)}
      description={taskDialogDescription(task)}
      footer={
        <div {...stylex.props(styles.footer)}>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button loading={busy} onClick={() => form.handleSubmit()}>
            {taskSubmitLabel(task)}
          </Button>
        </div>
      }
    >
      <TaskFormFields
        form={form}
        assigneeOptions={assigneeOptions}
        serverError={serverError}
        notice={notice}
      />
    </Dialog>
  );
}
