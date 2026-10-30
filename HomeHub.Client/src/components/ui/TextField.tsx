import type { AnyFieldApi } from '@tanstack/react-form';
import * as stylex from '@stylexjs/stylex';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { FieldShell } from './FieldShell';
import { shouldShowError } from './fieldState';
import { fieldStyles } from './formStyles';

type TextFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'onBlur'
> & {
  field: AnyFieldApi;
  label: string;
  optional?: boolean;
  hint?: string;
  startIcon?: ReactNode;
  endSlot?: ReactNode;
};

export function TextField({
  field,
  label,
  optional,
  hint,
  startIcon,
  endSlot,
  ...rest
}: TextFieldProps) {
  const invalid = shouldShowError(field);
  return (
    <FieldShell field={field} label={label} optional={optional} hint={hint}>
      <span {...stylex.props(fieldStyles.inputWrap)}>
        {startIcon && <span {...stylex.props(fieldStyles.startIcon)}>{startIcon}</span>}
        <input
          {...rest}
          value={String(field.state.value ?? '')}
          onChange={(event) => field.handleChange(event.target.value)}
          onBlur={field.handleBlur}
          {...stylex.props(
            fieldStyles.control,
            Boolean(startIcon) && fieldStyles.withStart,
            Boolean(endSlot) && fieldStyles.withEnd,
            invalid && fieldStyles.invalid,
          )}
        />
        {endSlot && <span {...stylex.props(fieldStyles.endSlot)}>{endSlot}</span>}
      </span>
    </FieldShell>
  );
}
