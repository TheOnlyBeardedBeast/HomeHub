export type RecurrenceFrequency = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
export type RecurrenceEnd = 'never' | 'until' | 'count';
export type MonthlyPattern = 'day' | 'weekday';
export type YearlyPattern = 'date' | 'weekday';

export interface RecurrenceDraft {
  frequency: RecurrenceFrequency;
  interval: number;
  weekdays: number[];
  monthlyPattern: MonthlyPattern;
  /** 1–31, or -1 for the last day of the month. */
  monthDay: number;
  /** 0 means every weekday in the month, 1–4 the nth, -1 the last. */
  monthOrdinal: number;
  monthWeekday: number;
  yearlyPattern: YearlyPattern;
  yearMonth: number;
  /** 1–31, or -1 for the last day of the month. */
  yearDay: number;
  yearOrdinal: number;
  yearWeekday: number;
  weekStart: string;
  end: RecurrenceEnd;
  until: string;
  count: number;
  custom: string;
}

export function defaultRecurrence(
  anchor: Date,
  frequency: RecurrenceFrequency = 'none',
): RecurrenceDraft {
  const weekday = anchor.getDay();
  return {
    frequency,
    interval: 1,
    weekdays: [weekday],
    monthlyPattern: 'day',
    monthDay: anchor.getDate(),
    monthOrdinal: 1,
    monthWeekday: weekday,
    yearlyPattern: 'date',
    yearMonth: anchor.getMonth(),
    yearDay: anchor.getDate(),
    yearOrdinal: 1,
    yearWeekday: weekday,
    weekStart: 'MO',
    end: 'never',
    until: '',
    count: 10,
    custom: '',
  };
}

export function recurrenceError(value: RecurrenceDraft): string | undefined {
  if (value.frequency === 'none') return undefined;
  if (value.frequency === 'custom') {
    return value.custom.trim() ? undefined : 'Enter an RRULE, such as FREQ=WEEKLY;BYDAY=MO.';
  }
  if (value.frequency === 'weekly' && value.weekdays.length === 0) {
    return 'Pick at least one day of the week.';
  }
  if (value.end === 'until' && !value.until) {
    return 'Pick the date this repeat ends, or choose Never.';
  }
  if (value.end === 'count' && (!Number.isInteger(value.count) || value.count < 1)) {
    return 'Enter how many times this should repeat.';
  }
  return undefined;
}
