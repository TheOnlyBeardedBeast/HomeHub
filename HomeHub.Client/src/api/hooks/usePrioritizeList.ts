import { useMutation, useQueryClient } from '@tanstack/react-query';
import { errorMessage } from '../../lib/errors';
import { toast } from '../../lib/toasts';
import { listClient } from '../clients';
import { keys } from '../keys';

export function usePrioritizeList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; prioritized: boolean }) =>
      listClient.setPriorityList(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.listsPrefix }),
    onError: (error) => toast(errorMessage(error), 'error'),
  });
}
