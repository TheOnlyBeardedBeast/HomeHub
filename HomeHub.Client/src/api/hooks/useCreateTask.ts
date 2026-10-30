import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toTimestamp } from '../../lib/format';
import { taskClient } from '../clients';
import { keys } from '../keys';

export interface TaskDraft {
  title: string;
  description?: string;
  assignedTo?: string;
  done?: boolean;
  recurringTaskId?: string;
  createdAt?: Date;
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (draft: TaskDraft) =>
      taskClient.createTask({
        task: {
          title: draft.title.trim(),
          description: draft.description?.trim() || undefined,
          assignedTo: draft.assignedTo || undefined,
          done: draft.done ?? false,
          recurringTaskId: draft.recurringTaskId,
          createdAt: draft.createdAt ? toTimestamp(draft.createdAt) : undefined,
        },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.tasksPrefix }),
  });
}
