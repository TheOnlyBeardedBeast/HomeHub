import * as stylex from '@stylexjs/stylex';
import type { CSSProperties } from 'react';
import { colors, radius } from '../../styles/tokens.stylex';

const styles = stylex.create({
  skeleton: {
    borderRadius: radius.md,
    backgroundImage: colors.skeleton,
    backgroundSize: '200% 100%',
    animationName: 'homehub-shimmer',
    animationDuration: '1.6s',
    animationIterationCount: 'infinite',
  },
});

export function Skeleton({
  width = '100%',
  height = 16,
}: {
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
}) {
  return <div {...stylex.props(styles.skeleton)} style={{ width, height }} />;
}
