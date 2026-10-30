import { CheckCircle2, Circle, Plus } from 'lucide-react';
import type { TaskMessage } from '../../api/hooks/useTasks';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { TaskRow } from './TaskRow';
import type { TaskTab } from './TasksTabs';

export function TaskListCard({
  tab,
  openTasks,
  doneTasks,
  nameFor,
  onAdd,
  onEdit,
}: {
  tab: Extract<TaskTab, 'open' | 'done'>;
  openTasks: TaskMessage[];
  doneTasks: TaskMessage[];
  nameFor: (id?: string) => string | undefined;
  onAdd: () => void;
  onEdit: (task: TaskMessage) => void;
}) {
  return (
    <Card padding="sm">
      {tab === 'open' && openTasks.length === 0 && (
        <EmptyState
          icon={CheckCircle2}
          title="Nothing left on the list"
          description="Every chore is done. Add something new if it is on your mind."
          action={
            <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={onAdd}>
              Add a task
            </Button>
          }
        />
      )}
      {tab === 'done' && doneTasks.length === 0 && (
        <EmptyState
          icon={Circle}
          title="Nothing finished yet"
          description="Completed tasks will collect here, a quiet record of the week's small wins."
        />
      )}
      {(tab === 'open' ? openTasks : doneTasks).map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          assigneeName={nameFor(task.assignedTo)}
          onEdit={onEdit}
        />
      ))}
    </Card>
  );
}
