import { useQuery } from '@tanstack/react-query';
import { userClient } from '../clients';
import { keys } from '../keys';

export function useUsers(enabled = true) {
  return useQuery({
    queryKey: keys.users,
    queryFn: async () => (await userClient.listUsers({})).users,
    enabled,
    staleTime: 60_000,
  });
}
