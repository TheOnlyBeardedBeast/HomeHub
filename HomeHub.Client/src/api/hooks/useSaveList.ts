import { useMutation, useQueryClient } from '@tanstack/react-query';
import { listClient } from '../clients';
import { keys } from '../keys';

export interface ListDraft {
  id?: string;
  title: string;
  items: string[];
}

export function useSaveList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (draft: ListDraft) => {
      const list = {
        id: draft.id ?? '',
        title: draft.title.trim(),
        content: draft.items.map((item) => item.trim()).filter(Boolean),
      };
      if (draft.id) {
        await listClient.updateList({ list });
        return draft.id;
      }
      const response = await listClient.createList({ list });
      return response.id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.listsPrefix }),
  });
}
