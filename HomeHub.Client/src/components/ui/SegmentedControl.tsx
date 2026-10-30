import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import { colors, fonts, motion, radius } from '../../styles/tokens.stylex';

const styles = stylex.create({
  segmented: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
    padding: '3px',
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSunken,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.border,
  },
  segment: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    height: '30px',
    paddingInline: '12px',
    borderWidth: 0,
    borderRadius: '9px',
    backgroundColor: 'transparent',
    color: colors.inkMuted,
    fontFamily: fonts.sans,
    fontSize: '12.5px',
    fontWeight: 580,
    transitionProperty: 'background-color, color, box-shadow',
    transitionDuration: motion.fast,
    ':hover': { color: colors.ink },
  },
  segmentActive: {
    backgroundColor: colors.surfaceRaised,
    color: colors.ink,
    boxShadow: '0 1px 2px rgba(45, 40, 31, 0.08)',
  },
});

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string; icon?: ReactNode }[];
  onChange: (value: T) => void;
}) {
  return (
    <div role="group" {...stylex.props(styles.segmented)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          {...stylex.props(styles.segment, value === option.value && styles.segmentActive)}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}
