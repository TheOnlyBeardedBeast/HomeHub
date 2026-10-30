import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskClient } from '../clients';
import { keys } from '../keys';

export function useDeleteRecurringTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => taskClient.deleteRecurringTask({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.recurringPrefix });
      queryClient.invalidateQueries({ queryKey: keys.tasksPrefix });
    },
  });
}
