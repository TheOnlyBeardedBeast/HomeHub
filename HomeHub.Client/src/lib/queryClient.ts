import { Code, ConnectError } from '@connectrpc/connect';
import { QueryClient } from '@tanstack/react-query';

// A 401 can come from an authenticating reverse proxy (e.g. NetBird) rather than
// an invalid API key, so an Unauthenticated error must not wipe the stored key.
export const queryClient = new QueryClient({
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
