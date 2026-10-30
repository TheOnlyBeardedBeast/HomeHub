import { useQuery } from '@tanstack/react-query';
import { eventClient } from '../clients';
import { keys } from '../keys';

export function useEvent(id: string | null, enabled = true) {
  return useQuery({
    queryKey: keys.event(id ?? 'none'),
    queryFn: async () => (await eventClient.getEvent({ id: id! })).event,
    enabled: Boolean(id) && enabled,
  });
}
