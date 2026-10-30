import * as stylex from '@stylexjs/stylex';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { colors, fonts, radius, space } from '../../styles/tokens.stylex';

const styles = stylex.create({
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '10px',
    paddingBlock: space.s9,
    paddingInline: space.s6,
    borderRadius: radius.lg,
    borderWidth: '1px',
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    backgroundColor: colors.emptySurface,
    '@media (min-width: 901px) and (min-height: 921px) and (max-height: 1100px)': {
      paddingBlock: '30px',
    },
    '@media (min-width: 901px) and (min-height: 881px) and (max-height: 920px)': {
      paddingBlock: '22px',
    },
    '@media (min-width: 901px) and (max-height: 880px)': { paddingBlock: '18px' },
  },
  emptyIcon: {
    display: 'grid',
    placeItems: 'center',
    width: '46px',
    height: '46px',
    borderRadius: radius.pill,
    backgroundColor: colors.accentWash,
    color: colors.accentInk,
    marginBottom: '2px',
  },
  emptyTitle: {
    fontFamily: fonts.display,
    fontSize: '19px',
    fontWeight: 540,
    color: colors.ink,
    margin: 0,
  },
  emptyDescription: {
    fontFamily: fonts.sans,
    fontSize: '13px',
    lineHeight: 1.55,
    color: colors.inkMuted,
    margin: 0,
    maxWidth: '360px',
  },
});

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div {...stylex.props(styles.empty)}>
      <span {...stylex.props(styles.emptyIcon)}>
        <Icon size={21} strokeWidth={1.7} />
      </span>
      <h3 {...stylex.props(styles.emptyTitle)}>{title}</h3>
      <p {...stylex.props(styles.emptyDescription)}>{description}</p>
      {action}
    </div>
  );
}
