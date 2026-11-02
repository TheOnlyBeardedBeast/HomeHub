import { useQuery } from '@tanstack/react-query';
import { $apiKey } from '../../lib/session';
import { apiBaseUrl } from '../clients';
import { keys } from '../keys';

async function fetchVersion(): Promise<string> {
  const apiKey = $apiKey.get();
  const response = await fetch(`${apiBaseUrl}/api/version`, {
    headers: apiKey ? { 'x-api-key': apiKey } : undefined,
  });
  if (!response.ok) {
    throw new Error(`Could not read the server version (${response.status}).`);
  }

  const body = (await response.json()) as { version?: unknown };
  return typeof body.version === 'string' ? body.version : 'unknown';
}

export function useVersion() {
  return useQuery({
    queryKey: keys.version,
    queryFn: fetchVersion,
    staleTime: 5 * 60_000,
  });
}
