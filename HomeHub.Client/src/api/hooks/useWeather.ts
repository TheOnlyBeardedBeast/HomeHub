import { useQuery } from '@tanstack/react-query';
import type { Weather } from '../../gen/integrations_pb';
import { weatherClient } from '../clients';
import { keys } from '../keys';

export type { Weather };

export function useWeather() {
  return useQuery({
    queryKey: keys.weather,
    queryFn: async (): Promise<Weather | null> =>
      (await weatherClient.getWeather({})).weather ?? null,
    // The hub caches upstream data for an hour; poll hourly so a wall display stays current.
    staleTime: 60 * 60 * 1000,
    refetchInterval: 60 * 60 * 1000,
    retry: false,
  });
}
