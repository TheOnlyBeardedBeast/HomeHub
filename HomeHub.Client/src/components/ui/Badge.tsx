import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import { colors, fonts, radius } from '../../styles/tokens.stylex';

const styles = stylex.create({
  badgeBase: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    paddingBlock: '3px',
    paddingInline: '8px',
    borderRadius: radius.pill,
    fontFamily: fonts.sans,
    fontSize: '10.5px',
    fontWeight: 640,
    letterSpacing: '0.02em',
    lineHeight: 1.3,
    whiteSpace: 'nowrap',
  },
  badgeNeutral: { backgroundColor: colors.surfaceSunken, color: colors.inkSoft },
  badgeAccent: { backgroundColor: colors.accentSoft, color: colors.accentInk },
  badgeOlive: { backgroundColor: colors.oliveSoft, color: colors.oliveInk },
  badgeSky: { backgroundColor: colors.skySoft, color: colors.skyInk },
  badgeDanger: { backgroundColor: colors.dangerSoft, color: colors.danger },
});

type BadgeTone = 'neutral' | 'accent' | 'olive' | 'sky' | 'danger';

const badgeTones: Record<BadgeTone, stylex.StyleXStyles> = {
  neutral: styles.badgeNeutral,
  accent: styles.badgeAccent,
  olive: styles.badgeOlive,
  sky: styles.badgeSky,
  danger: styles.badgeDanger,
};

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: BadgeTone }) {
  return <span {...stylex.props(styles.badgeBase, badgeTones[tone])}>{children}</span>;
}
