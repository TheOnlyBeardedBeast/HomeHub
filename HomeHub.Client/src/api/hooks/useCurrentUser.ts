import { useQuery } from '@tanstack/react-query';
import { userClient } from '../clients';
import { keys } from '../keys';

export function useCurrentUser() {
  return useQuery({
    queryKey: keys.currentUser,
    queryFn: async () => await userClient.getCurrentUser({}),
    staleTime: 60_000,
  });
}
