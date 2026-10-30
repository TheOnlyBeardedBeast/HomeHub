import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toTimestamp } from '../../lib/format';
import { eventClient } from '../clients';
import { keys } from '../keys';

export function useSkipOccurrence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, occurrence }: { eventId: string; occurrence: Date }) =>
      eventClient.removeOccurrence({
        eventId,
        occurrenceDate: toTimestamp(occurrence),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.eventsPrefix }),
  });
}
