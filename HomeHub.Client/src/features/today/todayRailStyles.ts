import * as stylex from '@stylexjs/stylex';
import { colors, fonts } from '../../styles/tokens.stylex';

export const railStyles = stylex.create({
  railHeading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    marginBottom: 'clamp(6px, 1vh, 10px)',
  },
  railTitle: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    fontFamily: fonts.sans,
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: colors.inkMuted,
  },
  railLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    fontFamily: fonts.sans,
    fontSize: '11.5px',
    fontWeight: 560,
    color: colors.accentInk,
    ':hover': { color: colors.accent },
  },
  railEmpty: {
    fontFamily: fonts.sans,
    fontSize: '12.5px',
    lineHeight: 1.55,
    color: colors.inkMuted,
    margin: 0,
  },
});
