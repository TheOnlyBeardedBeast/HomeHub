import { Code, ConnectError } from '@connectrpc/connect';

export function isUnauthenticated(error: unknown): boolean {
  return error instanceof ConnectError && error.code === Code.Unauthenticated;
}

export function isPermissionDenied(error: unknown): boolean {
  return error instanceof ConnectError && error.code === Code.PermissionDenied;
}

export function errorMessage(error: unknown): string {
  if (error instanceof ConnectError) {
    switch (error.code) {
      case Code.Unauthenticated:
        return 'That API key was not recognised. Ask the household admin for a new one.';
      case Code.PermissionDenied:
        return 'This key does not have permission for that. The admin key is needed here.';
      case Code.NotFound:
        return error.rawMessage || 'That item no longer exists.';
      case Code.InvalidArgument:
        return error.rawMessage || 'Some of those details do not look right.';
      case Code.Unavailable:
        return 'HomeHub is not reachable. Is the backend running?';
      default:
        return error.rawMessage || error.message;
    }
  }

  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}
