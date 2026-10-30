import { useQuery } from '@tanstack/react-query';
import type { List } from '../../gen/lists_pb';
import { listClient } from '../clients';
import { keys } from '../keys';

export type { List as ListMessage };

export function useLists() {
  return useQuery({
    queryKey: keys.listsPrefix,
    queryFn: async () => (await listClient.listLists({})).lists,
  });
}
