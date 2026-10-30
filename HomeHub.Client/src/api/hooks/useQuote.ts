import { useQuery } from '@tanstack/react-query';
import type { Quote } from '../../gen/integrations_pb';
import { quoteClient } from '../clients';
import { keys } from '../keys';

export type { Quote };

export function useQuote() {
  return useQuery({
    queryKey: keys.quote,
    queryFn: async (): Promise<Quote | null> => (await quoteClient.getQuote({})).quote ?? null,
    // The hub caches the quote for three hours; refetch on the same cadence.
    staleTime: 3 * 60 * 60 * 1000,
    refetchInterval: 3 * 60 * 60 * 1000,
    retry: false,
  });
}
