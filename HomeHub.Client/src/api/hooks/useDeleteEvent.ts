import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventClient } from '../clients';
import { keys } from '../keys';

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => eventClient.removeEvent({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.eventsPrefix });
      queryClient.invalidateQueries({ queryKey: keys.eventPrefix });
    },
  });
}
