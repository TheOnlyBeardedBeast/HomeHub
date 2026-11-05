import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { errorMessage } from '../../lib/errors';
import { toast } from '../../lib/toasts';
import { hostClient } from '../clients';

export function useDatabaseBackup() {
  const backup = useMutation({
    mutationFn: async () => {
      const parts: BlobPart[] = [];
      for await (const chunk of hostClient.backupDatabase({})) {
        if (chunk.data.length > 0) {
          const copy = new Uint8Array(chunk.data);
          parts.push(copy.buffer);
        }
      }
      return new Blob(parts, { type: 'application/vnd.sqlite3' });
    },
  });

  const download = useCallback(async () => {
    try {
      const blob = await backup.mutateAsync();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `homehub-backup-${new Date().toISOString().slice(0, 10)}.db`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast('Backup downloaded.', 'success');
    } catch (error) {
      toast(errorMessage(error), 'error');
    }
  }, [backup]);

  return { download, downloading: backup.isPending };
}
