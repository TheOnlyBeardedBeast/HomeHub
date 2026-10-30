import { useStore } from '@nanostores/react';
import * as stylex from '@stylexjs/stylex';
import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useCurrentUser } from '../api/hooks/useCurrentUser';
import { useUsers } from '../api/hooks/useUsers';
import { Button } from '../components/ui/Button';
import { PageError } from '../components/ui/PageError';
import { PageHeader } from '../components/ui/PageHeader';
import { CreateMemberDialog } from '../features/household/CreateMemberDialog';
import { DeleteMemberDialog } from '../features/household/DeleteMemberDialog';
import { HouseholdRail } from '../features/household/HouseholdRail';
import { MembersSection } from '../features/household/MembersSection';
import { ProfileCard } from '../features/household/ProfileCard';
import type { User } from '../gen/users_pb';
import { UserType } from '../gen/users_pb';
import { queryClient } from '../lib/queryClient';
import { $apiKey, clearApiKey } from '../lib/session';
import { toast } from '../lib/toasts';

const styles = stylex.create({
  grid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.35fr) minmax(270px, 0.8fr)',
    gap: '24px',
    alignItems: 'start',
    '@media (max-width: 1000px)': { gridTemplateColumns: 'minmax(0, 1fr)' },
  },
  left: { display: 'flex', flexDirection: 'column', gap: '26px', minWidth: 0 },
  rail: { display: 'flex', flexDirection: 'column', gap: '18px', minWidth: 0 },
});

export function HouseholdPage() {
  const currentUser = useCurrentUser();
  const isAdmin = currentUser.data?.isAdmin ?? false;
  const users = useUsers(isAdmin);
  const apiKey = useStore($apiKey);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const me = currentUser.data?.user;
  const isDisplay = me?.type === UserType.DISPLAY;
  const displayName = me?.fullName ?? 'Household admin';
  const members = users.data ?? [];

  if (currentUser.isError) {
    return (
      <>
        <PageHeader eyebrow="Members & keys" title="Who calls this home." />
        <PageError error={currentUser.error} onRetry={() => currentUser.refetch()} />
      </>
    );
  }

  function signOut() {
    clearApiKey();
    queryClient.clear();
    toast('Signed out.');
  }

  return (
    <>
      <PageHeader
        eyebrow="Members & keys"
        title="Who calls this home."
        description="Every person and shared display gets its own key. It keeps the calendar, tasks and notes attributable — and lets you hand out access without sharing yours."
        actions={
          isAdmin ? (
            <Button icon={<UserPlus size={15} />} onClick={() => setCreateOpen(true)}>
              Add member
            </Button>
          ) : undefined
        }
      />

      <div {...stylex.props(styles.grid)}>
        <div {...stylex.props(styles.left)}>
          <section>
            <ProfileCard
              pending={currentUser.isPending}
              displayName={displayName}
              isAdmin={isAdmin}
              isDisplay={isDisplay}
              apiKey={apiKey}
              onSignOut={signOut}
            />
          </section>

          <MembersSection
            isAdmin={isAdmin}
            pending={users.isPending}
            error={users.error}
            members={members}
            onRetry={() => users.refetch()}
            onAdd={() => setCreateOpen(true)}
            onDelete={setDeleteTarget}
          />
        </div>

        <aside {...stylex.props(styles.rail)}>
          <HouseholdRail />
        </aside>
      </div>

      {createOpen && <CreateMemberDialog onClose={() => setCreateOpen(false)} />}

      <DeleteMemberDialog member={deleteTarget} onClose={() => setDeleteTarget(null)} />
    </>
  );
}
