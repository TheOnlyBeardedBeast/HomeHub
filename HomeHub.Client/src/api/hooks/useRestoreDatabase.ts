import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { errorMessage } from '../../lib/errors';
import { $apiKey } from '../../lib/session';
import { toast } from '../../lib/toasts';
import { apiBaseUrl } from '../clients';

export function useRestoreDatabase() {
  const restore = useMutation({
    mutationFn: async (file: File) => {
      const apiKey = $apiKey.get();
      const response = await fetch(`${apiBaseUrl}/api/database/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          ...(apiKey ? { 'x-api-key': apiKey } : {}),
        },
        body: file,
      });

      if (!response.ok) {
        let message = `Restore failed (${response.status}).`;
        try {
          const body = (await response.json()) as { error?: unknown };
          if (typeof body.error === 'string') message = body.error;
        } catch {
          // Keep the status message when the response is not JSON.
        }
        throw new Error(message);
      }
    },
    onSuccess: () => {
      toast('Backup restored. Reloading…', 'success');
      window.location.reload();
    },
    onError: (error) => toast(errorMessage(error), 'error'),
  });

  const restoreFile = useCallback(
    (file: File) => {
      restore.mutate(file);
    },
    [restore],
  );

  return { restoreFile, restoring: restore.isPending };
}
