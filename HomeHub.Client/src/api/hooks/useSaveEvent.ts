import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toTimestamp } from '../../lib/format';
import { eventClient } from '../clients';
import { keys } from '../keys';

export interface EventDraft {
  id?: string;
  title: string;
  description?: string;
  start: Date;
  end?: Date;
  category: string;
  allDay: boolean;
  rrules?: string[];
  exceptDates?: Date[];
}

export function useSaveEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (draft: EventDraft) => {
      const event = {
        id: draft.id ?? '',
        title: draft.title.trim(),
        description: draft.description?.trim() || undefined,
        start: toTimestamp(draft.start),
        end: draft.end ? toTimestamp(draft.end) : undefined,
        category: draft.category,
        allDay: draft.allDay,
        rrules: draft.rrules ?? [],
        exceptDates: (draft.exceptDates ?? []).map(toTimestamp),
      };

      if (draft.id) {
        await eventClient.updateEvent({ event });
        return draft.id;
      }

      const response = await eventClient.createEvent({ event });
      return response.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.eventsPrefix });
      queryClient.invalidateQueries({ queryKey: keys.eventPrefix });
    },
  });
}
