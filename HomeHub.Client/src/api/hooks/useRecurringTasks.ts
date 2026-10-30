import { useQuery } from '@tanstack/react-query';
import { taskClient } from '../clients';
import { keys } from '../keys';

export function useRecurringTasks() {
  return useQuery({
    queryKey: keys.recurringPrefix,
    queryFn: async () => (await taskClient.listRecurringTasks({})).recurringTasks,
  });
}
