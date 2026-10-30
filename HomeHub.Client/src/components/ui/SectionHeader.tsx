import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import { colors, fonts, space } from '../../styles/tokens.stylex';

const styles = stylex.create({
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.s3,
    marginBottom: space.s3,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: '21px',
    fontWeight: 540,
    letterSpacing: '-0.02em',
    color: colors.ink,
    margin: 0,
  },
  sectionAction: { display: 'inline-flex', alignItems: 'center', gap: '4px' },
});

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div {...stylex.props(styles.sectionHeader)}>
      <h2 {...stylex.props(styles.sectionTitle)}>{title}</h2>
      {action && <div {...stylex.props(styles.sectionAction)}>{action}</div>}
    </div>
  );
}
