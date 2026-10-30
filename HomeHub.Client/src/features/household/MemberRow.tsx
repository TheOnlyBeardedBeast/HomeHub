import * as stylex from '@stylexjs/stylex';
import { Trash2 } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { IconButton } from '../../components/ui/Button';
import type { User } from '../../gen/users_pb';
import { UserType } from '../../gen/users_pb';
import { colors, fonts, radius } from '../../styles/tokens.stylex';

const styles = stylex.create({
  memberRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingBlock: '12px',
    paddingInline: '10px',
    marginInline: '-10px',
    borderRadius: radius.md,
    ':hover': { backgroundColor: colors.surfaceSunken },
  },
  memberBody: { display: 'flex', flexDirection: 'column', gap: '1px', flex: 1, minWidth: 0 },
  memberName: {
    fontFamily: fonts.sans,
    fontSize: '13.5px',
    fontWeight: 590,
    letterSpacing: '-0.01em',
    color: colors.ink,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  memberSub: {
    fontFamily: fonts.sans,
    fontSize: '11px',
    color: colors.inkMuted,
  },
  divider: { height: '1px', backgroundColor: colors.border, marginBlock: '2px' },
});

export function MemberRow({
  member,
  divided,
  onDelete,
}: {
  member: User;
  divided: boolean;
  onDelete: () => void;
}) {
  return (
    <div>
      {divided && <div {...stylex.props(styles.divider)} />}
      <div {...stylex.props(styles.memberRow)}>
        <Avatar name={member.fullName} size="md" />
        <div {...stylex.props(styles.memberBody)}>
          <span {...stylex.props(styles.memberName)}>{member.fullName}</span>
          <span {...stylex.props(styles.memberSub)}>
            {member.type === UserType.DISPLAY
              ? 'Shared display · one key signs it in'
              : 'Can sign in with their own key'}
          </span>
        </div>
        <IconButton label={`Delete ${member.fullName}`} size="sm" onClick={onDelete}>
          <Trash2 size={14} />
        </IconButton>
      </div>
    </div>
  );
}
