import { useMutation, useQueryClient } from '@tanstack/react-query';
import { noteClient } from '../clients';
import { keys } from '../keys';

export interface NoteDraft {
  id?: string;
  title: string;
  content: string;
}

export function useSaveNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (draft: NoteDraft) => {
      const note = { id: draft.id ?? '', title: draft.title.trim(), content: draft.content };
      if (draft.id) {
        await noteClient.updateNote({ note });
        return draft.id;
      }
      const response = await noteClient.createNote({ note });
      return response.id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.notesPrefix }),
  });
}
