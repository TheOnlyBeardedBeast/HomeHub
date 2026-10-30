import * as stylex from '@stylexjs/stylex';
import { Link, useLocation } from '@tanstack/react-router';
import { colors, fonts, motion, radius } from '../styles/tokens.stylex';
import { isNavActive, navItems } from './navItems';

const styles = stylex.create({
  bottomNav: {
    display: 'none',
    '@media (max-width: 900px)': {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      position: 'fixed',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 30,
      paddingTop: '7px',
      paddingBottom: 'calc(7px + env(safe-area-inset-bottom))',
      borderTopWidth: '1px',
      borderTopStyle: 'solid',
      borderTopColor: colors.border,
      backgroundColor: colors.glassNav,
      backdropFilter: 'blur(18px)',
      boxShadow: '0 -8px 30px rgba(45, 40, 31, 0.08)',
    },
  },
  bottomItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px',
    paddingBlock: '4px',
    color: colors.inkMuted,
    fontFamily: fonts.sans,
    fontSize: '9.5px',
    fontWeight: 560,
    letterSpacing: '0.01em',
  },
  bottomItemActive: { color: colors.accentInk },
  bottomIcon: {
    display: 'grid',
    placeItems: 'center',
    width: '34px',
    height: '27px',
    borderRadius: radius.pill,
    transitionProperty: 'background-color',
    transitionDuration: motion.fast,
  },
  bottomIconActive: { backgroundColor: colors.accentSoft },
});

export function BottomNav() {
  const location = useLocation();

  return (
    <nav {...stylex.props(styles.bottomNav)} aria-label="Main">
      {navItems.map((item) => {
        const active = isNavActive(item.to, location.pathname);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
            {...stylex.props(styles.bottomItem, active && styles.bottomItemActive)}
          >
            <span {...stylex.props(styles.bottomIcon, active && styles.bottomIconActive)}>
              <Icon size={19} strokeWidth={active ? 2.1 : 1.7} />
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
