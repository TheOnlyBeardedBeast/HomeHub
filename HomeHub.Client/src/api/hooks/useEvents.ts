import { useQuery } from '@tanstack/react-query';
import { toTimestamp } from '../../lib/format';
import { eventClient } from '../clients';
import { keys } from '../keys';

export function useEvents(start: Date, end: Date, enabled = true) {
  const startKey = start.toISOString();
  const endKey = end.toISOString();
  return useQuery({
    queryKey: keys.events(startKey, endKey),
    queryFn: async () => {
      const response = await eventClient.getEvents({
        range: { start: toTimestamp(start), end: toTimestamp(end) },
      });
      return response.events;
    },
    enabled,
  });
}
