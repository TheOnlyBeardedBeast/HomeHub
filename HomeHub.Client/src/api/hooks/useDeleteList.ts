import { useMutation, useQueryClient } from '@tanstack/react-query';
import { listClient } from '../clients';
import { keys } from '../keys';

export function useDeleteList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => listClient.deleteList({ id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.listsPrefix }),
  });
}
