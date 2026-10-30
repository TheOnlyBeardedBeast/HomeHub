import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Task as TaskMessage } from '../../gen/tasks_pb';
import { taskClient } from '../clients';
import { keys } from '../keys';

/**
 * Generated recurring occurrences are not persisted. Completing one creates a
 * regular task carrying the occurrence date; unchecking a persisted instance
 * simply updates it.
 */
export function useToggleTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (task: TaskMessage) => {
      if (task.recurringTaskId && !task.done) {
        await taskClient.createTask({
          task: {
            title: task.title,
            description: task.description,
            assignedTo: task.assignedTo,
            recurringTaskId: task.recurringTaskId,
            createdAt: task.createdAt,
            done: true,
          },
        });
        return;
      }

      await taskClient.updateTask({
        task: {
          id: task.id,
          title: task.title,
          description: task.description,
          assignedTo: task.assignedTo,
          done: !task.done,
          recurringTaskId: task.recurringTaskId,
          createdAt: task.createdAt,
        },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.tasksPrefix }),
  });
}
