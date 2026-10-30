import type {
  FormAsyncValidateOrFn,
  FormValidateOrFn,
  ReactFormExtendedApi,
} from '@tanstack/react-form';

/** The form instance returned by `useForm`, typed by its values. */
export type AppFormApi<TFormData> = ReactFormExtendedApi<
  TFormData,
  FormValidateOrFn<TFormData> | undefined,
  FormValidateOrFn<TFormData> | undefined,
  FormAsyncValidateOrFn<TFormData> | undefined,
  FormValidateOrFn<TFormData> | undefined,
  FormAsyncValidateOrFn<TFormData> | undefined,
  FormValidateOrFn<TFormData> | undefined,
  FormAsyncValidateOrFn<TFormData> | undefined,
  FormValidateOrFn<TFormData> | undefined,
  FormAsyncValidateOrFn<TFormData> | undefined,
  FormAsyncValidateOrFn<TFormData> | undefined,
  unknown
>;
