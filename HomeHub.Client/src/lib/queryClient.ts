import { Code, ConnectError } from '@connectrpc/connect';
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { clearApiKey } from './session';

function handleAuthFailure(error: unknown) {
  if (error instanceof ConnectError && error.code === Code.Unauthenticated) {
    clearApiKey();
  }
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleAuthFailure }),
  mutationCache: new MutationCache({ onError: handleAuthFailure }),
  defaultOptions: {
    queries: {
      staleTime: 20_000,
      refetchOnWindowFocus: true,
      retry: (failureCount, error) => {
        if (
          error instanceof ConnectError &&
          (error.code === Code.Unauthenticated ||
            error.code === Code.PermissionDenied ||
            error.code === Code.InvalidArgument)
        ) {
          return false;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
