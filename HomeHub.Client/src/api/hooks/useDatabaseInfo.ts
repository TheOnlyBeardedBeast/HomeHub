import { useQuery } from '@tanstack/react-query';
import { hostClient } from '../clients';
import { keys } from '../keys';

export function useDatabaseInfo(enabled: boolean) {
  return useQuery({
    queryKey: keys.databaseInfo,
    queryFn: async () => (await hostClient.getDatabaseInfo({})).path,
    enabled,
    staleTime: 60_000,
  });
}
