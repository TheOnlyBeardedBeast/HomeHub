import { useStore } from '@nanostores/react';
import * as stylex from '@stylexjs/stylex';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { $toasts, dismissToast, type ToastTone } from '../lib/toasts';
import { colors, fonts, radius, space } from '../styles/tokens.stylex';

const styles = stylex.create({
  viewport: {
    position: 'fixed',
    left: '50%',
    bottom: '26px',
    transform: 'translateX(-50%)',
    zIndex: 60,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: 'min(420px, calc(100vw - 28px))',
    pointerEvents: 'none',
    '@media (max-width: 900px)': { bottom: 'calc(82px + env(safe-area-inset-bottom))' },
  },
  toast: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '9px',
    padding: '11px 12px',
    borderRadius: radius.md,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceRaised,
    boxShadow: '0 2px 4px rgba(45, 40, 31, 0.05), 0 18px 40px rgba(45, 40, 31, 0.09)',
    fontFamily: fonts.sans,
    fontSize: '12.5px',
    lineHeight: 1.45,
    color: colors.ink,
    pointerEvents: 'auto',
    animationName: 'homehub-fade-up',
    animationDuration: '220ms',
    animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    animationFillMode: 'both',
  },
  icon: { flexShrink: 0, marginTop: 1 },
  info: { color: colors.sky },
  success: { color: colors.olive },
  error: { color: colors.danger },
  message: { flex: 1 },
  close: {
    display: 'inline-flex',
    borderWidth: 0,
    background: 'transparent',
    color: colors.inkFaint,
    padding: '2px',
    borderRadius: radius.sm,
    ':hover': { color: colors.ink, backgroundColor: colors.surfaceSunken },
  },
  offset: { marginTop: space.s1 },
});

const toneIcon: Record<ToastTone, typeof Info> = {
  info: Info,
  success: CheckCircle2,
  error: AlertCircle,
};

const toneStyle: Record<ToastTone, stylex.StyleXStyles> = {
  info: styles.info,
  success: styles.success,
  error: styles.error,
};

export function ToastViewport() {
  const toasts = useStore($toasts);
  if (toasts.length === 0) return null;

  return (
    <div {...stylex.props(styles.viewport)} aria-live="polite" aria-atomic="false">
      {toasts.map((item) => {
        const Icon = toneIcon[item.tone];
        return (
          <div key={item.id} {...stylex.props(styles.toast)} role="status">
            <Icon size={16} {...stylex.props(styles.icon, toneStyle[item.tone])} />
            <span {...stylex.props(styles.message)}>{item.message}</span>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => dismissToast(item.id)}
              {...stylex.props(styles.close)}
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
