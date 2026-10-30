import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import { colors, radius, shadow } from '../../styles/tokens.stylex';

const styles = stylex.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radius.lg,
    boxShadow: shadow.soft,
  },
  padNone: { padding: 0 },
  padSm: { padding: '14px' },
  padMd: {
    padding: '20px',
    '@media (min-width: 901px) and (max-height: 880px)': { padding: '16px' },
  },
  padLg: { padding: '26px' },
});

const padStyles = {
  none: styles.padNone,
  sm: styles.padSm,
  md: styles.padMd,
  lg: styles.padLg,
} as const;

export function Card({
  children,
  padding = 'md',
  sx,
}: {
  children: ReactNode;
  padding?: keyof typeof padStyles;
  sx?: stylex.StyleXStyles;
}) {
  return <div {...stylex.props(styles.card, padStyles[padding], sx)}>{children}</div>;
}
