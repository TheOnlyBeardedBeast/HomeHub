import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Task as TaskMessage } from '../../gen/tasks_pb';
import { isConcurrencyConflict } from '../../lib/errors';
import { taskClient } from '../clients';
import { keys } from '../keys';

export interface UpdateTaskInput {
  task: TaskMessage;
  force?: boolean;
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ task, force }: UpdateTaskInput) =>
      taskClient.updateTask({
        task: {
          id: task.id,
          title: task.title,
          description: task.description,
          assignedTo: task.assignedTo,
          done: task.done,
          recurringTaskId: task.recurringTaskId,
          createdAt: task.createdAt,
          version: task.version,
        },
        force,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.tasksPrefix }),
    onError: (error) => {
      if (isConcurrencyConflict(error)) {
        void queryClient.invalidateQueries({ queryKey: keys.tasksPrefix });
      }
    },
  });
}
