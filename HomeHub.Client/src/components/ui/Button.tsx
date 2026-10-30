import * as stylex from '@stylexjs/stylex';
import { LoaderCircle } from 'lucide-react';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { colors, fonts, motion, radius } from '../../styles/tokens.stylex';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'quiet';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const styles = stylex.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderRadius: radius.md,
    fontFamily: fonts.sans,
    fontWeight: 560,
    lineHeight: 1,
    letterSpacing: '-0.01em',
    whiteSpace: 'nowrap',
    transitionProperty: 'background-color, border-color, color, box-shadow, transform',
    transitionDuration: motion.fast,
    transitionTimingFunction: motion.ease,
    ':active': { transform: 'scale(0.98)' },
    ':disabled': { opacity: 0.55, cursor: 'not-allowed', transform: 'none' },
  },
  primary: {
    backgroundColor: colors.accent,
    color: colors.onAccent,
    boxShadow: '0 1px 2px rgba(45, 40, 31, 0.08)',
    ':hover': { backgroundColor: colors.accentHover },
    ':disabled': { backgroundColor: colors.accent },
  },
  secondary: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    color: colors.ink,
    boxShadow: '0 1px 2px rgba(45, 40, 31, 0.08)',
    ':hover': { backgroundColor: colors.surfaceSunken, borderColor: colors.borderStrong },
  },
  ghost: {
    backgroundColor: 'transparent',
    color: colors.inkSoft,
    ':hover': { backgroundColor: colors.surfaceSunken, color: colors.ink },
  },
  quiet: {
    backgroundColor: 'transparent',
    color: colors.inkMuted,
    ':hover': { backgroundColor: colors.surfaceSunken, color: colors.ink },
  },
  danger: {
    backgroundColor: colors.dangerSoft,
    color: colors.danger,
    ':hover': { backgroundColor: colors.dangerHover, borderColor: colors.dangerBorder },
  },
  sm: { height: '34px', paddingInline: '12px', fontSize: '13px' },
  md: { height: '40px', paddingInline: '16px', fontSize: '14px' },
  lg: { height: '46px', paddingInline: '20px', fontSize: '15px' },
  fullWidth: { width: '100%' },
  spinner: {
    animationName: 'homehub-spin',
    animationDuration: '850ms',
    animationIterationCount: 'infinite',
  },
  icon: { display: 'inline-flex', flexShrink: 0 },
});

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', icon, loading, fullWidth, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled || loading}
      {...rest}
      {...stylex.props(styles.base, styles[variant], styles[size], fullWidth && styles.fullWidth)}
    >
      {loading ? (
        <LoaderCircle size={size === 'sm' ? 14 : 16} {...stylex.props(styles.spinner)} />
      ) : (
        icon && <span {...stylex.props(styles.icon)}>{icon}</span>
      )}
      {children}
    </button>
  );
});

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: 'secondary' | 'ghost' | 'quiet';
  size?: 'sm' | 'md';
}

const iconButtonStyles = stylex.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    color: colors.inkMuted,
    transitionProperty: 'background-color, color, border-color, transform',
    transitionDuration: motion.fast,
    transitionTimingFunction: motion.ease,
    ':hover': { backgroundColor: colors.surfaceSunken, color: colors.ink },
    ':active': { transform: 'scale(0.94)' },
    ':disabled': { opacity: 0.5, cursor: 'not-allowed' },
  },
  secondary: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    color: colors.inkSoft,
    boxShadow: '0 1px 2px rgba(45, 40, 31, 0.08)',
  },
  ghost: { backgroundColor: 'transparent' },
  quiet: { backgroundColor: 'transparent' },
  sm: { width: '32px', height: '32px' },
  md: { width: '38px', height: '38px' },
});

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, variant = 'ghost', size = 'md', children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      {...rest}
      {...stylex.props(iconButtonStyles.base, iconButtonStyles[variant], iconButtonStyles[size])}
    >
      {children}
    </button>
  );
});
