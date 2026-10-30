import * as stylex from '@stylexjs/stylex';

/**
 * Warm, editorial design language inspired by Anthropic's product surfaces:
 * paper-toned neutrals, a single clay accent, and restrained supporting hues.
 * The dark theme keeps the same warm hues on true black for AMOLED screens.
 */
export const colors = stylex.defineVars({
  canvas: '#f5f2ea',
  canvasDeep: '#ece7db',
  surface: '#fbf9f4',
  surfaceRaised: '#fffefa',
  surfaceSunken: '#efebdf',
  ink: '#201e1a',
  inkSoft: '#4f4b42',
  inkMuted: '#7d7669',
  inkFaint: '#a49b8c',
  border: '#e2dccd',
  borderStrong: '#d1c7b5',
  borderFaint: 'rgba(209, 199, 181, 0.45)',
  accent: '#c96442',
  accentHover: '#b45434',
  accentInk: '#a14a2c',
  accentSoft: '#f2e0d7',
  accentWash: '#f8ede7',
  olive: '#6f7d5c',
  oliveSoft: '#e8eadf',
  oliveInk: '#536244',
  oliveBorder: '#d9ddca',
  sky: '#5f87a6',
  skySoft: '#e4edf3',
  skyInk: '#436981',
  amber: '#a9763f',
  amberSoft: '#f4e9d9',
  amberInk: '#835a2d',
  plum: '#866476',
  plumSoft: '#efe5ea',
  plumInk: '#684a59',
  danger: '#a5453a',
  dangerSoft: '#f5e1dd',
  dangerHover: '#efd3ce',
  dangerBorder: '#e3bdb5',
  dangerCardBorder: '#e7c8c1',
  onAccent: '#fffaf3',
  overlay: 'rgba(32, 30, 26, 0.42)',
  shadow: 'rgba(45, 40, 31, 0.08)',
  glass: 'rgba(245, 242, 234, 0.88)',
  glassNav: 'rgba(251, 249, 244, 0.92)',
  emptySurface: 'rgba(251, 249, 244, 0.6)',
  skeleton: 'linear-gradient(90deg, #efebdf 25%, #fffefa 50%, #efebdf 75%)',
  invalidBorder: '#c77d70',
  avatarBorder: 'rgba(255, 255, 255, 0.55)',
});

/**
 * True-black AMOLED palette. Surfaces stay a hair above #000 so cards, the
 * sidebar, and dialogs remain readable without lifting the canvas.
 */
export const darkTheme = stylex.createTheme(colors, {
  canvas: '#000000',
  canvasDeep: '#000000',
  surface: '#070707',
  surfaceRaised: '#101010',
  surfaceSunken: '#181816',
  ink: '#f4f1ea',
  inkSoft: '#d3cdc2',
  inkMuted: '#a49d91',
  inkFaint: '#797369',
  border: '#262421',
  borderStrong: '#3d3934',
  borderFaint: 'rgba(61, 57, 52, 0.65)',
  accent: '#e87a52',
  accentHover: '#f2916c',
  accentInk: '#f0946f',
  accentSoft: '#321a11',
  accentWash: '#1a0e09',
  olive: '#9caf83',
  oliveSoft: '#151a10',
  oliveInk: '#b9cba4',
  oliveBorder: '#28301c',
  sky: '#7fa9c9',
  skySoft: '#0d1720',
  skyInk: '#a9cce7',
  amber: '#d3a15c',
  amberSoft: '#20180c',
  amberInk: '#e6c28c',
  plum: '#c793ab',
  plumSoft: '#1f1419',
  plumInk: '#e0b8cb',
  danger: '#f08577',
  dangerSoft: '#2b1210',
  dangerHover: '#3a1a15',
  dangerBorder: '#5a271f',
  dangerCardBorder: '#4c211b',
  onAccent: '#180a05',
  overlay: 'rgba(0, 0, 0, 0.74)',
  shadow: 'rgba(0, 0, 0, 0.6)',
  glass: 'rgba(0, 0, 0, 0.78)',
  glassNav: 'rgba(5, 5, 5, 0.9)',
  emptySurface: '#050505',
  skeleton: 'linear-gradient(90deg, #0d0d0c 25%, #1d1d1b 50%, #0d0d0c 75%)',
  invalidBorder: '#c97466',
  avatarBorder: 'rgba(0, 0, 0, 0.65)',
});

export const fonts = stylex.defineVars({
  display: '"Newsreader Variable", "Iowan Old Style", "Palatino Linotype", Georgia, serif',
  sans: '"Inter Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  mono: '"SFMono-Regular", ui-monospace, "Cascadia Code", monospace',
});

export const radius = stylex.defineVars({
  sm: '8px',
  md: '12px',
  lg: '18px',
  xl: '26px',
  pill: '999px',
});

export const space = stylex.defineVars({
  s1: '4px',
  s2: '8px',
  s3: '12px',
  s4: '16px',
  s5: '20px',
  s6: '24px',
  s7: '32px',
  s8: '40px',
  s9: '56px',
  s10: '72px',
});

export const shadow = stylex.defineVars({
  soft: '0 1px 2px rgba(45, 40, 31, 0.04), 0 8px 24px rgba(45, 40, 31, 0.045)',
  lifted: '0 2px 4px rgba(45, 40, 31, 0.05), 0 18px 40px rgba(45, 40, 31, 0.09)',
  dialog: '0 24px 80px rgba(32, 30, 26, 0.22)',
  ring: '0 0 0 3px rgba(201, 100, 66, 0.14)',
});

export const darkShadow = stylex.createTheme(shadow, {
  soft: '0 1px 2px rgba(0, 0, 0, 0.6), 0 8px 24px rgba(0, 0, 0, 0.5)',
  lifted: '0 2px 4px rgba(0, 0, 0, 0.65), 0 18px 40px rgba(0, 0, 0, 0.6)',
  dialog: '0 24px 80px rgba(0, 0, 0, 0.9)',
  ring: '0 0 0 3px rgba(232, 122, 82, 0.26)',
});

export const motion = stylex.defineVars({
  fast: '140ms',
  base: '200ms',
  slow: '360ms',
  ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
});
