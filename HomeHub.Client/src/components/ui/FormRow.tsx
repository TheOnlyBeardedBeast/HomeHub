import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import { space } from '../../styles/tokens.stylex';

const styles = stylex.create({
  row: {
    display: 'grid',
    gap: space.s4,
    '@media (min-width: 640px)': { gridTemplateColumns: '1fr 1fr' },
  },
});

export function FormRow({ children }: { children: ReactNode }) {
  return <div {...stylex.props(styles.row)}>{children}</div>;
}
