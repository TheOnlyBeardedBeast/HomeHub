import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isConcurrencyConflict } from '../../lib/errors';
import { noteClient } from '../clients';
import { keys } from '../keys';

export interface NoteDraft {
  id?: string;
  title: string;
  content: string;
  version?: number;
  force?: boolean;
}

export function useSaveNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (draft: NoteDraft) => {
      const note = {
        id: draft.id ?? '',
        title: draft.title.trim(),
        content: draft.content,
        version: draft.version ?? 0,
      };
      if (draft.id) {
        await noteClient.updateNote({ note, force: draft.force });
        return draft.id;
      }
      const response = await noteClient.createNote({ note });
      return response.id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.notesPrefix }),
    onError: (error) => {
      if (isConcurrencyConflict(error)) {
        void queryClient.invalidateQueries({ queryKey: keys.notesPrefix });
      }
    },
  });
}
