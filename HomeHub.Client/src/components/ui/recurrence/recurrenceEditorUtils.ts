import {
  defaultRecurrence,
  type RecurrenceDraft,
  type RecurrenceFrequency,
} from '../../../lib/rrules';

export const ordinalOptions = [
  { value: 0, label: 'Every' },
  { value: 1, label: 'First' },
  { value: 2, label: 'Second' },
  { value: 3, label: 'Third' },
  { value: 4, label: 'Fourth' },
  { value: -1, label: 'Last' },
];

export function monthDayLabel(value: number): string {
  if (value === -1) return 'Last day';
  const mod100 = value % 100;
  const suffix =
    mod100 >= 11 && mod100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[value % 10] ?? 'th');
  return `${value}${suffix}`;
}

export const monthDayOptions = [
  ...Array.from({ length: 31 }, (_, index) => {
    const value = index + 1;
    return { value: String(value), label: monthDayLabel(value) };
  }),
  { value: '-1', label: 'Last day' },
];

export function daysInMonth(month: number): number {
  return new Date(2024, month + 1, 0).getDate();
}

export function yearDayOptions(month: number): { value: string; label: string }[] {
  return [
    ...Array.from({ length: daysInMonth(month) }, (_, index) => {
      const day = index + 1;
      return { value: String(day), label: monthDayLabel(day) };
    }),
    { value: '-1', label: 'Last day' },
  ];
}

export function isPresetFrequency(frequency: RecurrenceFrequency): boolean {
  return frequency !== 'none' && frequency !== 'custom';
}

export function buildFrequencyOptions(
  allowNone: boolean,
): { value: RecurrenceFrequency; label: string }[] {
  return [
    ...(allowNone ? [{ value: 'none' as const, label: 'Does not repeat' }] : []),
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'custom', label: 'Custom rule (advanced)…' },
  ];
}

export function changeFrequency(
  value: RecurrenceDraft,
  frequency: RecurrenceFrequency,
  anchor: Date,
): RecurrenceDraft | null {
  if (frequency === value.frequency) return null;
  if (frequency === 'none' || frequency === 'custom') {
    return { ...value, frequency };
  }

  const next = defaultRecurrence(anchor, frequency);
  next.interval = Math.max(1, Math.floor(value.interval) || 1);
  next.weekStart = value.weekStart;
  next.end = value.end;
  next.until = value.until;
  next.count = value.count;
  next.custom = value.custom;
  return next;
}

export function unitLabel(frequency: RecurrenceFrequency, interval: number): string {
  const pair =
    frequency === 'daily'
      ? ['day', 'days']
      : frequency === 'weekly'
        ? ['week', 'weeks']
        : frequency === 'monthly'
          ? ['month', 'months']
          : frequency === 'yearly'
            ? ['year', 'years']
            : ['time', 'times'];
  return interval === 1 ? pair[0] : pair[1];
}
