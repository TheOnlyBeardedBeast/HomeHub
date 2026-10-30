import { useQuery } from '@tanstack/react-query';
import { toTimestamp } from '../../lib/format';
import { taskClient } from '../clients';
import { keys } from '../keys';

export function useTasksInRange(start: Date, end: Date, enabled = true) {
  return useQuery({
    queryKey: [...keys.tasksPrefix, 'range', start.toISOString(), end.toISOString()] as const,
    queryFn: async () => {
      const response = await taskClient.getTasksInRange({
        range: { start: toTimestamp(start), end: toTimestamp(end) },
      });
      return response.tasks;
    },
    enabled,
  });
}
