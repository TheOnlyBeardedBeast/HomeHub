import type { AnyFieldApi } from '@tanstack/react-form';
import * as stylex from '@stylexjs/stylex';
import { ChevronDown } from 'lucide-react';
import type { SelectHTMLAttributes } from 'react';
import { FieldShell } from './FieldShell';
import { shouldShowError } from './fieldState';
import { fieldStyles } from './formStyles';

type SelectFieldProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'value' | 'onChange' | 'onBlur'
> & {
  field: AnyFieldApi;
  label: string;
  optional?: boolean;
  hint?: string;
  options: { value: string; label: string }[];
};

export function SelectField({ field, label, optional, hint, options, ...rest }: SelectFieldProps) {
  const invalid = shouldShowError(field);
  return (
    <FieldShell field={field} label={label} optional={optional} hint={hint}>
      <span {...stylex.props(fieldStyles.selectWrap)}>
        <select
          {...rest}
          value={String(field.state.value ?? '')}
          onChange={(event) => field.handleChange(event.target.value)}
          onBlur={field.handleBlur}
          {...stylex.props(fieldStyles.control, fieldStyles.select, invalid && fieldStyles.invalid)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown size={15} {...stylex.props(fieldStyles.chevron)} />
      </span>
    </FieldShell>
  );
}
