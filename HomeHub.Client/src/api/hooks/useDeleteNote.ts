import { useMutation, useQueryClient } from '@tanstack/react-query';
import { noteClient } from '../clients';
import { keys } from '../keys';

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => noteClient.deleteNote({ id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.notesPrefix }),
  });
}
