import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userClient } from '../clients';
import { keys } from '../keys';

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => userClient.deleteUser({ id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.users }),
  });
}
