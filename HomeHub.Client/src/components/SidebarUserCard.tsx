import * as stylex from '@stylexjs/stylex';
import { Link } from '@tanstack/react-router';
import { LogOut, Settings2 } from 'lucide-react';
import { colors, fonts, motion, radius } from '../styles/tokens.stylex';
import { Avatar } from './ui/Avatar';
import { Badge } from './ui/Badge';
import { IconButton } from './ui/Button';
import { Skeleton } from './ui/Skeleton';

const styles = stylex.create({
  loadingUser: { display: 'flex', alignItems: 'center', gap: '9px', padding: '8px' },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px',
    borderRadius: radius.md,
    transitionProperty: 'background-color',
    transitionDuration: motion.fast,
    ':hover': { backgroundColor: colors.surfaceSunken },
  },
  userCopy: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1 },
  userName: {
    fontFamily: fonts.sans,
    fontSize: '12.5px',
    fontWeight: 630,
    color: colors.ink,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userRole: {
    fontFamily: fonts.sans,
    fontSize: '10.5px',
    color: colors.inkMuted,
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
});

export function SidebarUserCard({
  pending,
  displayName,
  roleLabel,
  isAdmin,
  onSignOut,
}: {
  pending: boolean;
  displayName: string;
  roleLabel: string;
  isAdmin: boolean;
  onSignOut: () => void;
}) {
  return (
    <>
      {pending ? (
        <div {...stylex.props(styles.loadingUser)}>
          <Skeleton width={38} height={38} />
          <Skeleton width={110} height={14} />
        </div>
      ) : (
        <Link to="/household" {...stylex.props(styles.userCard)}>
          <Avatar name={displayName} size="md" />
          <span {...stylex.props(styles.userCopy)}>
            <span {...stylex.props(styles.userName)}>{displayName}</span>
            <span {...stylex.props(styles.userRole)}>
              {isAdmin && <Badge tone="accent">Admin</Badge>}
              {!isAdmin && roleLabel}
            </span>
          </span>
          <Settings2 size={15} color={colors.inkFaint} />
        </Link>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
        <IconButton label="Sign out" size="sm" onClick={onSignOut}>
          <LogOut size={15} />
        </IconButton>
      </div>
    </>
  );
}
