import { useForm } from '@tanstack/react-form';
import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';
import { useCreateTask } from '../../api/hooks/useCreateTask';
import type { TaskMessage } from '../../api/hooks/useTasks';
import { useUpdateTask } from '../../api/hooks/useUpdateTask';
import { Button } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';
import { errorMessage } from '../../lib/errors';
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

export function TaskDialog({ task, onClose }: { task?: TaskMessage; onClose: () => void }) {
  const create = useCreateTask();
  const update = useUpdateTask();
  const { assigneeOptions } = usePeople();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: taskDefaults(task),
    onSubmit: async ({ value }) => {
      setServerError(null);
      if (!value.title.trim()) return;
      try {
        if (task) {
          await update.mutateAsync({
            ...task,
            title: value.title.trim(),
            description: value.description.trim() || undefined,
            assignedTo: value.assignedTo || undefined,
            done: value.done,
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
        setServerError(errorMessage(error));
      }
    },
  });

  const busy = create.isPending || update.isPending;

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
      <TaskFormFields form={form} assigneeOptions={assigneeOptions} serverError={serverError} />
    </Dialog>
  );
}
