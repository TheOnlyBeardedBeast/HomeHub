import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UserType } from '../../gen/users_pb';
import { userClient } from '../clients';
import { keys } from '../keys';

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { fullName: string; type: UserType }) => userClient.createUser(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.users }),
  });
}
