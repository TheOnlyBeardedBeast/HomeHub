import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskClient } from '../clients';
import { keys } from '../keys';

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => taskClient.deleteTask({ id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.tasksPrefix }),
  });
}
