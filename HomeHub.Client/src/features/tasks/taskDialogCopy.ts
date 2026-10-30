import type { TaskMessage } from '../../api/hooks/useTasks';

export function taskDefaults(task?: TaskMessage) {
  return {
    title: task?.title ?? '',
    description: task?.description ?? '',
    assignedTo: task?.assignedTo ?? '',
    done: task?.done ?? false,
  };
}

export function taskDialogTitle(task?: TaskMessage): string {
  return task ? 'Edit task' : 'New task';
}

export function taskDialogDescription(task?: TaskMessage): string {
  return task
    ? 'Update the details for everyone in the household.'
    : 'A one-off job for someone — or for whoever gets there first.';
}

export function taskSubmitLabel(task?: TaskMessage): string {
  return task ? 'Save changes' : 'Add task';
}
