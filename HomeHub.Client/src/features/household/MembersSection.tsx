import * as stylex from '@stylexjs/stylex';
import { ShieldCheck, UserPlus, Users } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageError } from '../../components/ui/PageError';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Skeleton } from '../../components/ui/Skeleton';
import type { User } from '../../gen/users_pb';
import { colors, fonts, radius } from '../../styles/tokens.stylex';
import { MemberRow } from './MemberRow';

const styles = stylex.create({
  count: {
    fontFamily: fonts.sans,
    fontSize: '11px',
    fontWeight: 620,
    color: colors.inkMuted,
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.pill,
    padding: '3px 9px',
  },
  loadingMembers: { display: 'flex', flexDirection: 'column', gap: '12px' },
  loadingRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  helper: { display: 'flex', alignItems: 'flex-start', gap: '12px' },
  helperTitle: {
    margin: '0 0 4px',
    fontFamily: fonts.sans,
    fontSize: '13px',
    fontWeight: 620,
    color: colors.ink,
  },
  helperBody: {
    margin: 0,
    fontFamily: fonts.sans,
    fontSize: '12.5px',
    lineHeight: 1.55,
    color: colors.inkMuted,
  },
});

export function MembersSection({
  isAdmin,
  pending,
  error,
  members,
  onRetry,
  onAdd,
  onDelete,
}: {
  isAdmin: boolean;
  pending: boolean;
  error: unknown;
  members: User[];
  onRetry: () => void;
  onAdd: () => void;
  onDelete: (member: User) => void;
}) {
  return (
    <section>
      <SectionHeader
        title="Members & displays"
        action={
          isAdmin ? (
            <span {...stylex.props(styles.count)}>
              {members.length === 1 ? '1 key' : `${members.length} keys`}
            </span>
          ) : undefined
        }
      />
      <Card padding="md">
        {!isAdmin ? (
          <div {...stylex.props(styles.helper)}>
            <ShieldCheck size={18} color={colors.olive} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <p {...stylex.props(styles.helperTitle)}>Member list is admin-only</p>
              <p {...stylex.props(styles.helperBody)}>
                Ask the household admin if you need a key for someone new, or if yours has been
                lost.
              </p>
            </div>
          </div>
        ) : pending ? (
          <div {...stylex.props(styles.loadingMembers)}>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} {...stylex.props(styles.loadingRow)}>
                <Skeleton width={38} height={38} />
                <Skeleton width="35%" height={14} />
              </div>
            ))}
          </div>
        ) : error ? (
          <PageError error={error} onRetry={onRetry} />
        ) : members.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Just the admin so far"
            description="Create a key for each person in the house — and for any shared display — so their activity stays attributable."
            action={
              <Button variant="secondary" size="sm" icon={<UserPlus size={14} />} onClick={onAdd}>
                Add the first member
              </Button>
            }
          />
        ) : (
          members.map((member, index) => (
            <MemberRow
              key={member.id}
              member={member}
              divided={index > 0}
              onDelete={() => onDelete(member)}
            />
          ))
        )}
      </Card>
    </section>
  );
}
