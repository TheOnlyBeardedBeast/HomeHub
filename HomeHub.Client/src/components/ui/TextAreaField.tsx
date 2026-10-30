import type { AnyFieldApi } from '@tanstack/react-form';
import * as stylex from '@stylexjs/stylex';
import type { TextareaHTMLAttributes } from 'react';
import { FieldShell } from './FieldShell';
import { shouldShowError } from './fieldState';
import { fieldStyles } from './formStyles';

type TextAreaFieldProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'value' | 'onChange' | 'onBlur'
> & {
  field: AnyFieldApi;
  label: string;
  optional?: boolean;
  hint?: string;
};

export function TextAreaField({ field, label, optional, hint, ...rest }: TextAreaFieldProps) {
  const invalid = shouldShowError(field);
  return (
    <FieldShell field={field} label={label} optional={optional} hint={hint}>
      <textarea
        {...rest}
        value={String(field.state.value ?? '')}
        onChange={(event) => field.handleChange(event.target.value)}
        onBlur={field.handleBlur}
        {...stylex.props(fieldStyles.control, fieldStyles.textarea, invalid && fieldStyles.invalid)}
      />
    </FieldShell>
  );
}
