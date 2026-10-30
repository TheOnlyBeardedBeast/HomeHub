import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { Dialog } from './Dialog';

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Delete',
  destructive = true,
  busy = false,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant={destructive ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={busy}
            icon={destructive ? <AlertTriangle size={14} /> : undefined}
          >
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}
