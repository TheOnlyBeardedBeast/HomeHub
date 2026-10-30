import { Plus, Repeat2 } from 'lucide-react';
import { useState } from 'react';
import { useDeleteRecurringTask } from '../api/hooks/useDeleteRecurringTask';
import { useRecurringTasks } from '../api/hooks/useRecurringTasks';
import { useTasks, type TaskMessage } from '../api/hooks/useTasks';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { PageError } from '../components/ui/PageError';
import { PageHeader } from '../components/ui/PageHeader';
import { PageSkeleton } from '../components/ui/PageSkeleton';
import type { RecurringTask } from '../gen/tasks_pb';
import { RecurringTaskDialog } from '../features/tasks/RecurringTaskDialog';
import { RecurringTaskList } from '../features/tasks/RecurringTaskList';
import { TaskDialog } from '../features/tasks/TaskDialog';
import { TaskListCard } from '../features/tasks/TaskListCard';
import { TasksTabs, type TaskTab } from '../features/tasks/TasksTabs';
import { errorMessage } from '../lib/errors';
import { usePeople } from '../lib/people';
import { toast } from '../lib/toasts';

export function TasksPage() {
  const tasks = useTasks();
  const recurring = useRecurringTasks();
  const removeRecurring = useDeleteRecurringTask();
  const { nameFor } = usePeople();
  const [tab, setTab] = useState<TaskTab>('open');
  const [taskDialog, setTaskDialog] = useState<{ task?: TaskMessage } | null>(null);
  const [recurringDialog, setRecurringDialog] = useState<{ task?: RecurringTask } | null>(null);
  const [deleteRecurringTarget, setDeleteRecurringTarget] = useState<RecurringTask | null>(null);

  const allTasks = tasks.data ?? [];
  const openTasks = allTasks.filter((task) => !task.done);
  const doneTasks = allTasks.filter((task) => task.done);
  const repeating = recurring.data ?? [];
  const activeError = tab === 'repeating' ? recurring.error : tasks.error;
  const retry = tab === 'repeating' ? recurring.refetch : tasks.refetch;
  const loading = tab === 'repeating' ? recurring.isPending : tasks.isPending;

  return (
    <>
      <PageHeader
        eyebrow="Chores, errands and small wins"
        title="What needs doing."
        description="The running list of things the house needs from someone. Tick them off as they happen."
        actions={
          <>
            <Button
              variant="secondary"
              icon={<Repeat2 size={15} />}
              onClick={() => setRecurringDialog({})}
            >
              Repeating task
            </Button>
            <Button icon={<Plus size={15} />} onClick={() => setTaskDialog({})}>
              New task
            </Button>
          </>
        }
      />

      <TasksTabs
        tab={tab}
        openCount={openTasks.length}
        doneCount={doneTasks.length}
        repeatingCount={repeating.length}
        onTabChange={setTab}
      />

      {loading ? (
        <PageSkeleton rows={5} />
      ) : activeError ? (
        <PageError error={activeError} onRetry={retry} />
      ) : tab === 'repeating' ? (
        <RecurringTaskList
          tasks={repeating}
          nameFor={nameFor}
          onAdd={() => setRecurringDialog({})}
          onEdit={(task) => setRecurringDialog({ task })}
          onDelete={setDeleteRecurringTarget}
        />
      ) : (
        <TaskListCard
          tab={tab}
          openTasks={openTasks}
          doneTasks={doneTasks}
          nameFor={nameFor}
          onAdd={() => setTaskDialog({})}
          onEdit={(task) => setTaskDialog({ task })}
        />
      )}

      {taskDialog && <TaskDialog task={taskDialog.task} onClose={() => setTaskDialog(null)} />}
      {recurringDialog && (
        <RecurringTaskDialog
          recurringTask={recurringDialog.task}
          onClose={() => setRecurringDialog(null)}
        />
      )}
      <ConfirmDialog
        open={Boolean(deleteRecurringTarget)}
        title="Delete this repeating task?"
        description="It will stop appearing on future days. Days already completed stay in the history."
        busy={removeRecurring.isPending}
        onClose={() => setDeleteRecurringTarget(null)}
        onConfirm={() => {
          if (!deleteRecurringTarget) return;
          removeRecurring.mutate(deleteRecurringTarget.id, {
            onSuccess: () => {
              toast('Repeating task deleted.', 'success');
              setDeleteRecurringTarget(null);
            },
            onError: (error) => {
              setDeleteRecurringTarget(null);
              toast(errorMessage(error), 'error');
            },
          });
        }}
      />
    </>
  );
}
