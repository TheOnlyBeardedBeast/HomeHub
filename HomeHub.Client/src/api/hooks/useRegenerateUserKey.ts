import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userClient } from '../clients';
import { keys } from '../keys';

export function useRegenerateUserKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => userClient.regenerateUserKey({ id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.users }),
  });
}
