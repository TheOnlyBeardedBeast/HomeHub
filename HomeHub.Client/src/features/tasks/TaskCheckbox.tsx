import * as stylex from '@stylexjs/stylex';
import { Check, LoaderCircle } from 'lucide-react';
import { colors, motion } from '../../styles/tokens.stylex';

const styles = stylex.create({
  checkbox: {
    display: 'grid',
    placeItems: 'center',
    width: '19px',
    height: '19px',
    marginTop: '1px',
    borderWidth: '1.5px',
    borderStyle: 'solid',
    borderColor: colors.borderStrong,
    borderRadius: '6px',
    backgroundColor: colors.surfaceRaised,
    color: 'transparent',
    transitionProperty: 'background-color, border-color',
    transitionDuration: motion.fast,
    ':hover': { borderColor: colors.accent },
    ':disabled': { opacity: 0.6 },
  },
  checkboxDone: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
    color: colors.onAccent,
  },
  spinner: {
    animationName: 'homehub-spin',
    animationDuration: '850ms',
    animationIterationCount: 'infinite',
  },
});

export function TaskCheckbox({
  title,
  done,
  pending,
  onToggle,
}: {
  title: string;
  done: boolean;
  pending: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={done}
      aria-label={done ? `Mark "${title}" as not done` : `Complete "${title}"`}
      disabled={pending}
      onClick={onToggle}
      {...stylex.props(styles.checkbox, done && styles.checkboxDone)}
    >
      {pending ? (
        <LoaderCircle size={12} {...stylex.props(styles.spinner)} />
      ) : (
        done && <Check size={13} strokeWidth={2.6} />
      )}
    </button>
  );
}
