import { useCurrentUser } from '../api/hooks/useCurrentUser';
import { useUsers } from '../api/hooks/useUsers';

/**
 * Name resolution for tasks, notes and lists. Member lists are admin-only, so
 * everyone else falls back to their own name or a neutral label.
 */
export function usePeople() {
  const currentUser = useCurrentUser();
  const isAdmin = currentUser.data?.isAdmin ?? false;
  const users = useUsers(isAdmin);
  const members = users.data ?? [];
  const me = currentUser.data?.user;

  const names = new Map(members.map((member) => [member.id, member.fullName]));
  if (me) names.set(me.id, me.fullName);

  function nameFor(id?: string): string | undefined {
    if (!id) return undefined;
    return names.get(id) ?? 'Household member';
  }

  const assigneeOptions = [
    { value: '', label: 'Anyone in the house' },
    ...members.map((member) => ({ value: member.id, label: member.fullName })),
  ];
  if (me && !members.some((member) => member.id === me.id)) {
    assigneeOptions.push({ value: me.id, label: `${me.fullName} (you)` });
  }

  return {
    members,
    isAdmin,
    me,
    membersLoading: users.isPending,
    nameFor,
    assigneeOptions,
  };
}
