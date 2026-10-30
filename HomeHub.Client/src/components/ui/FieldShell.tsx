import type { AnyFieldApi } from '@tanstack/react-form';
import * as stylex from '@stylexjs/stylex';
import { AlertCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { colors, fonts } from '../../styles/tokens.stylex';
import { fieldError, shouldShowError } from './fieldState';

const styles = stylex.create({
  field: { display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 },
  label: {
    fontFamily: fonts.sans,
    fontSize: '12.5px',
    fontWeight: 620,
    letterSpacing: '-0.005em',
    color: colors.inkSoft,
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px',
  },
  optional: {
    fontSize: '11px',
    fontWeight: 460,
    color: colors.inkFaint,
  },
  hint: { fontFamily: fonts.sans, fontSize: '11.5px', color: colors.inkMuted, margin: 0 },
  error: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontFamily: fonts.sans,
    fontSize: '11.5px',
    color: colors.danger,
    margin: 0,
  },
});

export function FieldShell({
  field,
  label,
  optional,
  hint,
  children,
}: {
  field: AnyFieldApi;
  label: string;
  optional?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  const error = shouldShowError(field) ? fieldError(field) : undefined;
  return (
    <label {...stylex.props(styles.field)}>
      <span {...stylex.props(styles.label)}>
        {label}
        {optional && <span {...stylex.props(styles.optional)}>optional</span>}
      </span>
      {children}
      {error ? (
        <span {...stylex.props(styles.error)}>
          <AlertCircle size={12} />
          {error}
        </span>
      ) : (
        hint && <span {...stylex.props(styles.hint)}>{hint}</span>
      )}
    </label>
  );
}
