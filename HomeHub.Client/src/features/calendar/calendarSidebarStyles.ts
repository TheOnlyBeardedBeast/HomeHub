import * as stylex from '@stylexjs/stylex';
import { colors, fonts } from '../../styles/tokens.stylex';

export const sidebarStyles = stylex.create({
  side: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    '@media (min-width: 1081px)': { position: 'sticky', top: '24px' },
  },
  sideHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '10px',
    marginBottom: '12px',
  },
  sideDate: {
    fontFamily: fonts.display,
    fontSize: '22px',
    fontWeight: 520,
    letterSpacing: '-0.025em',
    lineHeight: 1.15,
    color: colors.ink,
    margin: 0,
  },
  sideSub: {
    fontFamily: fonts.sans,
    fontSize: '11px',
    fontWeight: 620,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: colors.accentInk,
    marginBottom: '5px',
    display: 'block',
  },
  sideEmpty: {
    fontFamily: fonts.sans,
    fontSize: '12.5px',
    lineHeight: 1.6,
    color: colors.inkMuted,
    margin: '0 0 14px',
  },
  legend: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    paddingTop: '12px',
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
  },
  legendItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontFamily: fonts.sans,
    fontSize: '10.5px',
    color: colors.inkMuted,
  },
});
