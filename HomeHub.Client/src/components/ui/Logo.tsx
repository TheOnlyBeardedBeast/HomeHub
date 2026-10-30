import * as stylex from '@stylexjs/stylex';
import { House } from 'lucide-react';
import { colors, fonts, radius } from '../../styles/tokens.stylex';

const styles = stylex.create({
  brand: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    color: colors.ink,
  },
  mark: {
    display: 'grid',
    placeItems: 'center',
    width: '34px',
    height: '34px',
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    color: colors.onAccent,
    boxShadow: 'inset 0 -1px 0 rgba(32, 30, 26, 0.14)',
  },
  markLarge: { width: '46px', height: '46px', borderRadius: radius.lg },
  wordmark: {
    fontFamily: fonts.display,
    fontSize: '22px',
    fontWeight: 560,
    letterSpacing: '-0.025em',
    lineHeight: 1,
  },
  wordmarkLarge: { fontSize: '28px' },
});

export function Logo({ size = 'md' }: { size?: 'md' | 'lg' }) {
  return (
    <span {...stylex.props(styles.brand)}>
      <span {...stylex.props(styles.mark, size === 'lg' && styles.markLarge)}>
        <House size={size === 'lg' ? 24 : 18} strokeWidth={1.9} />
      </span>
      <span {...stylex.props(styles.wordmark, size === 'lg' && styles.wordmarkLarge)}>HomeHub</span>
    </span>
  );
}
