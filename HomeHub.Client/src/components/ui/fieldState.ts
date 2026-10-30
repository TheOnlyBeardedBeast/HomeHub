import type { AnyFieldApi } from '@tanstack/react-form';

export function fieldError(field: AnyFieldApi): string | undefined {
  const errors = field.state.meta.errors;
  if (errors.length === 0) return undefined;
  const first = errors[0];
  return typeof first === 'string' ? first : undefined;
}

export function shouldShowError(field: AnyFieldApi): boolean {
  return field.state.meta.isTouched && field.state.meta.errors.length > 0;
}
