import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import { colors, fonts, motion, space } from '../../styles/tokens.stylex';

const styles = stylex.create({
  header: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: space.s4,
    marginBottom: 'clamp(18px, 2.9vh, 32px)',
    '@media (min-width: 901px) and (max-height: 880px)': { marginBottom: '16px' },
    animationName: 'homehub-fade-up',
    animationDuration: '420ms',
    animationTimingFunction: motion.ease,
    animationFillMode: 'both',
  },
  headerText: { display: 'flex', flexDirection: 'column', gap: '7px', maxWidth: '680px' },
  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    fontFamily: fonts.sans,
    fontSize: '11px',
    fontWeight: 650,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: colors.accentInk,
  },
  pageTitle: {
    fontFamily: fonts.display,
    fontSize: 'clamp(34px, 4.2vw, 46px)',
    fontWeight: 480,
    letterSpacing: '-0.035em',
    lineHeight: 1.02,
    color: colors.ink,
    margin: 0,
    '@media (min-width: 901px) and (max-height: 880px)': { fontSize: '38px' },
  },
  pageDescription: {
    fontFamily: fonts.sans,
    fontSize: '14.5px',
    lineHeight: 1.55,
    color: colors.inkMuted,
    margin: 0,
    maxWidth: '560px',
  },
  headerActions: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  phoneHidden: {
    '@media (max-width: 900px)': { display: 'none' },
    // The home page is a fixed-height dashboard on desktop; the description
    // gives way on shorter screens so the content below stays above the fold.
    '@media (min-width: 901px) and (max-height: 1100px)': { display: 'none' },
  },
});

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  hideDescriptionOnPhone = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  hideDescriptionOnPhone?: boolean;
}) {
  return (
    <header {...stylex.props(styles.header)}>
      <div {...stylex.props(styles.headerText)}>
        {eyebrow && <span {...stylex.props(styles.eyebrow)}>{eyebrow}</span>}
        <h1 {...stylex.props(styles.pageTitle)}>{title}</h1>
        {description && (
          <p
            {...stylex.props(styles.pageDescription, hideDescriptionOnPhone && styles.phoneHidden)}
          >
            {description}
          </p>
        )}
      </div>
      {actions && <div {...stylex.props(styles.headerActions)}>{actions}</div>}
    </header>
  );
}
