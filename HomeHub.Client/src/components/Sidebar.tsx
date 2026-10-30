import * as stylex from '@stylexjs/stylex';
import { Link, useLocation } from '@tanstack/react-router';
import { PanelLeftClose, PanelLeftOpen, Users } from 'lucide-react';
import { colors, fonts, motion, shadow } from '../styles/tokens.stylex';
import { isNavActive, navItems } from './navItems';
import { SidebarNavItem } from './SidebarNavItem';
import { SidebarUserCard } from './SidebarUserCard';
import { IconButton } from './ui/Button';
import { Logo } from './ui/Logo';
import { ThemeToggle } from './ThemeToggle';

const styles = stylex.create({
  sidebar: {
    position: 'sticky',
    top: 0,
    display: 'flex',
    flexDirection: 'column',
    width: '238px',
    flexShrink: 0,
    height: '100dvh',
    // On short windows the nav scrolls inside the rail instead of pushing the
    // page taller than the viewport.
    overflowY: 'auto',
    paddingBlock: '22px',
    paddingInline: '15px',
    borderRightWidth: '1px',
    borderRightStyle: 'solid',
    borderRightColor: colors.border,
    backgroundColor: colors.surface,
    '@media (max-width: 900px)': { display: 'none' },
  },
  sidebarHidden: { display: 'none' },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    paddingInline: '8px',
    marginBottom: '34px',
  },
  brandActions: { display: 'flex', alignItems: 'center', gap: '2px' },
  navGroup: { display: 'flex', flexDirection: 'column', gap: '3px' },
  groupLabel: {
    fontFamily: fonts.sans,
    fontSize: '9.5px',
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: colors.inkFaint,
    paddingInline: '12px',
    marginTop: '18px',
    marginBottom: '7px',
    ':first-child': { marginTop: 0 },
  },
  sidebarFooter: {
    marginTop: 'auto',
    paddingTop: '14px',
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
  },
  revealSidebar: {
    display: 'none',
    '@media (min-width: 901px)': {
      display: 'grid',
      placeItems: 'center',
      position: 'fixed',
      left: 0,
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 20,
      width: '26px',
      height: '52px',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderLeftWidth: 0,
      borderColor: colors.border,
      borderRadius: '0 12px 12px 0',
      backgroundColor: colors.surfaceRaised,
      color: colors.inkMuted,
      boxShadow: shadow.soft,
      cursor: 'pointer',
      transitionProperty: 'background-color, color',
      transitionDuration: motion.fast,
      ':hover': { backgroundColor: colors.surface, color: colors.ink },
    },
  },
});

export function Sidebar({
  hidden,
  displayName,
  roleLabel,
  isAdmin,
  pending,
  onHide,
  onShow,
  onSignOut,
}: {
  hidden: boolean;
  displayName: string;
  roleLabel: string;
  isAdmin: boolean;
  pending: boolean;
  onHide: () => void;
  onShow: () => void;
  onSignOut: () => void;
}) {
  const location = useLocation();

  return (
    <>
      <aside id="app-sidebar" {...stylex.props(styles.sidebar, hidden && styles.sidebarHidden)}>
        <div {...stylex.props(styles.brandRow)}>
          <Link to="/" aria-label="HomeHub home">
            <Logo />
          </Link>
          <div {...stylex.props(styles.brandActions)}>
            <ThemeToggle />
            <IconButton
              label="Hide sidebar"
              size="sm"
              aria-controls="app-sidebar"
              aria-expanded={!hidden}
              onClick={onHide}
            >
              <PanelLeftClose size={16} />
            </IconButton>
          </div>
        </div>

        <nav {...stylex.props(styles.navGroup)} aria-label="Main">
          <span {...stylex.props(styles.groupLabel)}>Today</span>
          {navItems.map((item) => (
            <SidebarNavItem
              key={item.to}
              to={item.to}
              label={item.label}
              icon={item.icon}
              active={isNavActive(item.to, location.pathname)}
            />
          ))}
          <span {...stylex.props(styles.groupLabel)}>Household</span>
          <SidebarNavItem
            to="/household"
            label="Members & keys"
            icon={Users}
            active={location.pathname.startsWith('/household')}
          />
        </nav>

        <div {...stylex.props(styles.sidebarFooter)}>
          <SidebarUserCard
            pending={pending}
            displayName={displayName}
            roleLabel={roleLabel}
            isAdmin={isAdmin}
            onSignOut={onSignOut}
          />
        </div>
      </aside>

      {hidden && (
        <button
          type="button"
          aria-label="Show sidebar"
          title="Show sidebar"
          aria-controls="app-sidebar"
          aria-expanded={!hidden}
          onClick={onShow}
          {...stylex.props(styles.revealSidebar)}
        >
          <PanelLeftOpen size={15} />
        </button>
      )}
    </>
  );
}
