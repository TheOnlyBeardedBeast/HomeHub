import type { AnyFieldApi } from '@tanstack/react-form';
import * as stylex from '@stylexjs/stylex';
import { colors, fonts, motion, radius, space } from '../../styles/tokens.stylex';

const styles = stylex.create({
  switchRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.s4,
    paddingBlock: '10px',
  },
  switchCopy: { display: 'flex', flexDirection: 'column', gap: '2px' },
  switchLabel: { fontFamily: fonts.sans, fontSize: '13px', fontWeight: 600, color: colors.inkSoft },
  switchHint: { fontFamily: fonts.sans, fontSize: '11.5px', color: colors.inkMuted },
  switch: {
    position: 'relative',
    width: '42px',
    height: '24px',
    flexShrink: 0,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
    borderWidth: 0,
    padding: 0,
    transitionProperty: 'background-color',
    transitionDuration: motion.fast,
  },
  switchOn: { backgroundColor: colors.accent },
  switchThumb: {
    position: 'absolute',
    top: '3px',
    left: '3px',
    width: '18px',
    height: '18px',
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceRaised,
    boxShadow: '0 1px 2px rgba(32, 30, 26, 0.2)',
    transitionProperty: 'transform',
    transitionDuration: motion.fast,
    transitionTimingFunction: motion.ease,
  },
  switchThumbOn: { transform: 'translateX(18px)' },
});

export function SwitchField({
  field,
  label,
  hint,
}: {
  field: AnyFieldApi;
  label: string;
  hint?: string;
}) {
  const checked = Boolean(field.state.value);
  return (
    <div {...stylex.props(styles.switchRow)}>
      <span {...stylex.props(styles.switchCopy)}>
        <span {...stylex.props(styles.switchLabel)}>{label}</span>
        {hint && <span {...stylex.props(styles.switchHint)}>{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => field.handleChange(!checked)}
        {...stylex.props(styles.switch, checked && styles.switchOn)}
      >
        <span {...stylex.props(styles.switchThumb, checked && styles.switchThumbOn)} />
      </button>
    </div>
  );
}
