import { useDeleteUser } from '../../api/hooks/useDeleteUser';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import type { User } from '../../gen/users_pb';
import { errorMessage } from '../../lib/errors';
import { toast } from '../../lib/toasts';

export function DeleteMemberDialog({
  member,
  onClose,
}: {
  member: User | null;
  onClose: () => void;
}) {
  const removeUser = useDeleteUser();

  return (
    <ConfirmDialog
      open={Boolean(member)}
      title="Remove this member?"
      description={
        member
          ? `${member.fullName} will lose access immediately. Their notes and tasks stay in the household.`
          : ''
      }
      busy={removeUser.isPending}
      onClose={onClose}
      onConfirm={() => {
        if (!member) return;
        removeUser.mutate(member.id, {
          onSuccess: () => {
            toast(`${member.fullName} was removed.`, 'success');
            onClose();
          },
          onError: (error) => {
            onClose();
            toast(errorMessage(error), 'error');
          },
        });
      }}
    />
  );
}
