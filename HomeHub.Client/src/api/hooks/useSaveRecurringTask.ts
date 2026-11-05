import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isConcurrencyConflict } from '../../lib/errors';
import { toTimestamp } from '../../lib/format';
import { taskClient } from '../clients';
import { keys } from '../keys';

export interface RecurringTaskDraft {
  id?: string;
  title: string;
  description?: string;
  assignedTo?: string;
  rrule: string;
  createdAt?: Date;
  version?: number;
  force?: boolean;
}

export function useSaveRecurringTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (draft: RecurringTaskDraft) => {
      const recurringTask = {
        id: draft.id ?? '',
        title: draft.title.trim(),
        description: draft.description?.trim() || undefined,
        assignedTo: draft.assignedTo || undefined,
        rrule: draft.rrule.trim(),
        createdAt: toTimestamp(draft.createdAt ?? new Date()),
        version: draft.version ?? 0,
      };

      if (draft.id) {
        await taskClient.updateRecurringTask({ recurringTask, force: draft.force });
        return draft.id;
      }

      const response = await taskClient.createRecurringTask({ recurringTask });
      return response.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.recurringPrefix });
      queryClient.invalidateQueries({ queryKey: keys.tasksPrefix });
    },
    onError: (error) => {
      if (isConcurrencyConflict(error)) {
        void queryClient.invalidateQueries({ queryKey: keys.recurringPrefix });
        void queryClient.invalidateQueries({ queryKey: keys.tasksPrefix });
      }
    },
  });
}
