import * as stylex from '@stylexjs/stylex';
import { colors, fonts, radius } from '../../styles/tokens.stylex';
import { initials } from '../../lib/format';

type Size = 'xs' | 'sm' | 'md' | 'lg';

const palettes = [
  { backgroundColor: colors.accentSoft, color: colors.accentInk },
  { backgroundColor: colors.oliveSoft, color: colors.olive },
  { backgroundColor: colors.skySoft, color: colors.sky },
  { backgroundColor: colors.amberSoft, color: colors.amber },
  { backgroundColor: colors.plumSoft, color: colors.plum },
  { backgroundColor: colors.surfaceSunken, color: colors.inkSoft },
];

function paletteFor(name: string) {
  let hash = 0;
  for (let index = 0; index < name.length; index++) {
    hash = (hash * 31 + name.charCodeAt(index)) >>> 0;
  }
  return palettes[hash % palettes.length];
}

const styles = stylex.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderRadius: radius.pill,
    fontFamily: fonts.sans,
    fontWeight: 650,
    letterSpacing: '0.01em',
    userSelect: 'none',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.avatarBorder,
  },
  xs: { width: '24px', height: '24px', fontSize: '9px' },
  sm: { width: '30px', height: '30px', fontSize: '10px' },
  md: { width: '38px', height: '38px', fontSize: '12px' },
  lg: { width: '52px', height: '52px', fontSize: '15px' },
});

export function Avatar({ name, size = 'md' }: { name: string; size?: Size }) {
  return (
    <span aria-hidden="true" {...stylex.props(styles.base, styles[size])} style={paletteFor(name)}>
      {initials(name)}
    </span>
  );
}
