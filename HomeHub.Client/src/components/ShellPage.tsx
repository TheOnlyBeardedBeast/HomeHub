import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import { motion } from '../styles/tokens.stylex';

const styles = stylex.create({
  content: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '1230px',
    minHeight: '100dvh',
    marginInline: 'auto',
    paddingBlock: '42px 56px',
    paddingInline: '44px',
    '@media (min-width: 901px) and (min-height: 921px) and (max-height: 1100px)': {
      paddingBlock: '28px 30px',
    },
    '@media (min-width: 901px) and (min-height: 881px) and (max-height: 920px)': {
      paddingBlock: '20px 22px',
    },
    '@media (min-width: 901px) and (max-height: 880px)': { paddingBlock: '14px 16px' },
    '@media (max-width: 1100px)': { paddingInline: '30px' },
    '@media (max-width: 900px)': {
      minHeight: 'auto',
      paddingBlock: '26px 98px',
      paddingInline: '20px',
    },
  },
  page: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    animationName: 'homehub-fade-up',
    animationDuration: '460ms',
    animationTimingFunction: motion.ease,
    animationFillMode: 'both',
  },
  // With the sidebar hidden (display mode), the home dashboard is the whole
  // screen — centre it instead of leaving all the spare height at the bottom.
  pageCentered: {
    '@media (min-width: 901px)': { justifyContent: 'center' },
  },
});

export function ShellPage({
  pathname,
  sidebarHidden,
  children,
}: {
  pathname: string;
  sidebarHidden: boolean;
  children: ReactNode;
}) {
  const centered = sidebarHidden && pathname === '/';

  return (
    <div {...stylex.props(styles.content)}>
      <div key={pathname} {...stylex.props(styles.page, centered && styles.pageCentered)}>
        {children}
      </div>
    </div>
  );
}
