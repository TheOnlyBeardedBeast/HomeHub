import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Task as TaskMessage } from '../../gen/tasks_pb';
import { taskClient } from '../clients';
import { keys } from '../keys';

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (task: TaskMessage) =>
      taskClient.updateTask({
        task: {
          id: task.id,
          title: task.title,
          description: task.description,
          assignedTo: task.assignedTo,
          done: task.done,
          recurringTaskId: task.recurringTaskId,
          createdAt: task.createdAt,
        },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.tasksPrefix }),
  });
}
