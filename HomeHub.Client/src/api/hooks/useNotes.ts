import { useQuery } from '@tanstack/react-query';
import type { Note } from '../../gen/notes_pb';
import { noteClient } from '../clients';
import { keys } from '../keys';

export type { Note as NoteMessage };

export function useNotes(search: string) {
  const query = search.trim();
  return useQuery({
    queryKey: [...keys.notesPrefix, query] as const,
    queryFn: async () => {
      if (query) return (await noteClient.searchNotes({ query })).notes;
      return (await noteClient.listNotes({})).notes;
    },
  });
}
