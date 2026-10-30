import * as stylex from '@stylexjs/stylex';
import { Link } from '@tanstack/react-router';
import type { LucideIcon } from 'lucide-react';
import { colors, fonts, motion, radius } from '../styles/tokens.stylex';

const styles = stylex.create({
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '11px',
    height: '40px',
    paddingInline: '11px',
    borderRadius: radius.md,
    color: colors.inkMuted,
    fontFamily: fonts.sans,
    fontSize: '13.5px',
    fontWeight: 530,
    transitionProperty: 'background-color, color',
    transitionDuration: motion.fast,
    ':hover': { backgroundColor: colors.surfaceSunken, color: colors.ink },
  },
  navLinkActive: {
    backgroundColor: colors.accentWash,
    color: colors.accentInk,
    fontWeight: 640,
  },
  navIcon: { display: 'inline-flex', color: 'currentColor', opacity: 0.9 },
  navIconActive: { color: colors.accent },
});

export function SidebarNavItem({
  to,
  label,
  icon: Icon,
  active,
}: {
  to: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      aria-current={active ? 'page' : undefined}
      {...stylex.props(styles.navLink, active && styles.navLinkActive)}
    >
      <span {...stylex.props(styles.navIcon, active && styles.navIconActive)}>
        <Icon size={17} strokeWidth={active ? 2 : 1.7} />
      </span>
      {label}
    </Link>
  );
}
