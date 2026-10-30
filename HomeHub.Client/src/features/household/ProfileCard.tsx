import * as stylex from '@stylexjs/stylex';
import { KeyRound, LogOut } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { maskApiKey } from '../../lib/session';
import { colors, fonts, radius, shadow } from '../../styles/tokens.stylex';

const styles = stylex.create({
  profile: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    padding: '24px',
    borderRadius: radius.xl,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
    boxShadow: shadow.soft,
    flexWrap: 'wrap',
  },
  profileBody: { display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, minWidth: '180px' },
  profileName: {
    fontFamily: fonts.display,
    fontSize: '30px',
    fontWeight: 500,
    letterSpacing: '-0.03em',
    lineHeight: 1.1,
    color: colors.ink,
    margin: 0,
  },
  profileRole: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    marginTop: '2px',
    flexWrap: 'wrap',
  },
  roleNote: {
    fontFamily: fonts.sans,
    fontSize: '12px',
    color: colors.inkMuted,
  },
  keyChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    marginTop: '10px',
    padding: '6px 10px',
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSunken,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.border,
    fontFamily: fonts.mono,
    fontSize: '10.5px',
    color: colors.inkMuted,
    maxWidth: '100%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  keyIcon: { color: colors.inkFaint, flexShrink: 0 },
});

export function ProfileCard({
  pending,
  displayName,
  isAdmin,
  isDisplay,
  apiKey,
  onSignOut,
}: {
  pending: boolean;
  displayName: string;
  isAdmin: boolean;
  isDisplay: boolean;
  apiKey: string | null;
  onSignOut: () => void;
}) {
  if (pending) {
    return (
      <div {...stylex.props(styles.profile)}>
        <Skeleton width={52} height={52} />
        <div style={{ flex: 1 }}>
          <Skeleton width="45%" height={26} />
        </div>
      </div>
    );
  }

  return (
    <div {...stylex.props(styles.profile)}>
      <Avatar name={displayName} size="lg" />
      <div {...stylex.props(styles.profileBody)}>
        <h2 {...stylex.props(styles.profileName)}>{displayName}</h2>
        <div {...stylex.props(styles.profileRole)}>
          <Badge tone={isAdmin ? 'accent' : isDisplay ? 'sky' : 'olive'}>
            {isAdmin ? 'Household admin' : isDisplay ? 'Shared display' : 'Household member'}
          </Badge>
          <span {...stylex.props(styles.roleNote)}>
            {isDisplay ? 'signed in on this shared screen' : 'signed in on this device'}
          </span>
        </div>
        <span {...stylex.props(styles.keyChip)} title="Only the last four characters are shown">
          <KeyRound size={12} {...stylex.props(styles.keyIcon)} />
          {apiKey ? maskApiKey(apiKey) : 'No key stored'}
        </span>
      </div>
      <Button variant="secondary" size="sm" icon={<LogOut size={14} />} onClick={onSignOut}>
        Sign out
      </Button>
    </div>
  );
}
