import * as stylex from '@stylexjs/stylex';
import { Link } from '@tanstack/react-router';
import { LogOut } from 'lucide-react';
import { colors } from '../styles/tokens.stylex';
import { ThemeToggle } from './ThemeToggle';
import { Avatar } from './ui/Avatar';
import { IconButton } from './ui/Button';
import { Logo } from './ui/Logo';

const styles = stylex.create({
  mobileHeader: {
    display: 'none',
    '@media (max-width: 900px)': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 20,
      height: '60px',
      paddingInline: '18px',
      borderBottomWidth: '1px',
      borderBottomStyle: 'solid',
      borderBottomColor: colors.border,
      backgroundColor: colors.glass,
      backdropFilter: 'blur(16px)',
    },
  },
  mobileActions: { display: 'flex', alignItems: 'center', gap: '6px' },
});

export function MobileHeader({
  displayName,
  onSignOut,
}: {
  displayName: string;
  onSignOut: () => void;
}) {
  return (
    <header {...stylex.props(styles.mobileHeader)}>
      <Link to="/" aria-label="HomeHub home">
        <Logo />
      </Link>
      <div {...stylex.props(styles.mobileActions)}>
        <ThemeToggle />
        <IconButton label="Sign out" size="sm" onClick={onSignOut}>
          <LogOut size={16} />
        </IconButton>
        <Link to="/household" aria-label="Household and account">
          <Avatar name={displayName} size="sm" />
        </Link>
      </div>
    </header>
  );
}
