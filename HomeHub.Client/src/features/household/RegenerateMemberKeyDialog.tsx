import { useCallback, useState } from 'react';
import { useRegenerateUserKey } from '../../api/hooks/useRegenerateUserKey';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Dialog } from '../../components/ui/Dialog';
import type { User } from '../../gen/users_pb';
import { errorMessage } from '../../lib/errors';
import { toast } from '../../lib/toasts';
import { MemberKeyResult } from './MemberKeyResult';

export function RegenerateMemberKeyDialog({
  member,
  onClose,
}: {
  member: User;
  onClose: () => void;
}) {
  const regenerate = useRegenerateUserKey();
  const [regenerated, setRegenerated] = useState<{ name: string; apiKey: string } | null>(null);

  const confirm = useCallback(() => {
    regenerate.mutate(member.id, {
      onSuccess: (response) => {
        setRegenerated({
          name: response.user?.fullName ?? member.fullName,
          apiKey: response.apiKey,
        });
      },
      onError: (error) => {
        toast(errorMessage(error), 'error');
      },
    });
  }, [member, regenerate]);

  if (regenerated) {
    return (
      <Dialog
        open
        onClose={onClose}
        title="The new key is ready"
        description="The previous key stops working immediately. Copy the new one now and update that device."
        footer={<Button onClick={onClose}>Done</Button>}
      >
        <MemberKeyResult name={regenerated.name} apiKey={regenerated.apiKey} />
      </Dialog>
    );
  }

  return (
    <ConfirmDialog
      open
      title="Generate a new key?"
      description={`${member.fullName}'s current key stops working immediately. The new key is shown once.`}
      confirmLabel="Generate new key"
      destructive={false}
      busy={regenerate.isPending}
      onConfirm={confirm}
      onClose={onClose}
    />
  );
}
