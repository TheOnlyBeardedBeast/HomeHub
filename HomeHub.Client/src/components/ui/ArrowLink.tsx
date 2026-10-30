import * as stylex from '@stylexjs/stylex';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';

const styles = stylex.create({
  sectionAction: { display: 'inline-flex', alignItems: 'center', gap: '4px' },
  arrow: { opacity: 0.6 },
});

export function ArrowLink({ children }: { children: ReactNode }) {
  return (
    <span {...stylex.props(styles.sectionAction)}>
      {children}
      <ArrowRight size={13} {...stylex.props(styles.arrow)} />
    </span>
  );
}
