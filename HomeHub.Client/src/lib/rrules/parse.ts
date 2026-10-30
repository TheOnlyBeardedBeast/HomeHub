import { ALLOWED_KEYS, dayIndexByCode } from './constants.ts';
import { defaultRecurrence, type RecurrenceDraft, type RecurrenceFrequency } from './types.ts';

interface DaySpec {
  ordinal: number;
  day: number;
}

export interface RuleParts {
  rawByDay?: string;
  rawByMonthDay?: string;
  rawByMonth?: string;
  byDay?: DaySpec[];
  byMonthDay?: number;
  byMonth?: number;
}

export function positiveInt(value: string | undefined, fallback = 1): number | null {
  if (value === undefined) return fallback;
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 1 ? parsed : null;
}

export function splitRule(rule: string): Map<string, string> | null {
  const normalized = rule.replace(/^RRULE:/i, '').trim();
  if (!normalized) return null;

  const parts = new Map<string, string>();
  for (const chunk of normalized.split(';')) {
    const separator = chunk.indexOf('=');
    if (separator <= 0) return null;
    const key = chunk.slice(0, separator).trim().toUpperCase();
    const value = chunk
      .slice(separator + 1)
      .trim()
      .toUpperCase();
    if (!key || !value || parts.has(key)) return null;
    parts.set(key, value);
  }
  return parts;
}

export function parseByDay(value: string): DaySpec[] | null {
  const result: DaySpec[] = [];
  for (const item of value.split(',')) {
    const match = /^([+-]?\d{1,2})?(SU|MO|TU|WE|TH|FR|SA)$/.exec(item.trim());
    if (!match) return null;
    const ordinal = match[1] ? Number(match[1]) : 0;
    if (![0, 1, 2, 3, 4, -1].includes(ordinal)) return null;
    result.push({ ordinal, day: dayIndexByCode[match[2]] });
  }
  return result.length > 0 ? result : null;
}

export function parseByMonthDay(value: string): number | null {
  const items = value.split(',');
  if (items.length !== 1) return null;
  const day = Number(items[0]);
  if (day === -1) return day;
  return Number.isInteger(day) && day >= 1 && day <= 31 ? day : null;
}

export function parseByMonth(value: string): number | null {
  const items = value.split(',');
  if (items.length !== 1) return null;
  const month = Number(items[0]);
  return Number.isInteger(month) && month >= 1 && month <= 12 ? month : null;
}

function dateOnlyInput(value: string): string | null {
  const match = /^(\d{4})(\d{2})(\d{2})$/.exec(value);
  if (!match) return null;
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return `${match[1]}-${match[2]}-${match[3]}`;
}

interface TimeOfDayParts {
  month: string;
  day: string;
  hours: string;
  minutes: string;
  seconds: string;
}

function validTimeOfDay({ month, day, hours, minutes, seconds }: TimeOfDayParts): boolean {
  return (
    Number(month) >= 1 &&
    Number(month) <= 12 &&
    Number(day) >= 1 &&
    Number(day) <= 31 &&
    Number(hours) <= 23 &&
    Number(minutes) <= 59 &&
    Number(seconds) <= 59
  );
}

function timestampInput(value: string): string | null {
  const stamp = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/.exec(value);
  if (!stamp) return null;

  const [, year, month, day, hours, minutes, seconds, utc] = stamp;
  if (!validTimeOfDay({ month, day, hours, minutes, seconds })) return null;

  const date = utc
    ? new Date(
        Date.UTC(
          Number(year),
          Number(month) - 1,
          Number(day),
          Number(hours),
          Number(minutes),
          Number(seconds),
        ),
      )
    : new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hours),
        Number(minutes),
        Number(seconds),
      );

  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

function untilDateInput(value: string): string | null {
  return dateOnlyInput(value) ?? timestampInput(value);
}

function parseFrequency(value: string | undefined): RecurrenceFrequency | null {
  switch (value) {
    case 'DAILY':
      return 'daily';
    case 'WEEKLY':
      return 'weekly';
    case 'MONTHLY':
      return 'monthly';
    case 'YEARLY':
      return 'yearly';
    default:
      return null;
  }
}

function hasOnlyAllowedKeys(parts: Map<string, string>): boolean {
  for (const key of parts.keys()) {
    if (!ALLOWED_KEYS.has(key)) return false;
  }
  return true;
}

function applyEnd(base: RecurrenceDraft, parts: Map<string, string>): boolean {
  if (parts.has('COUNT') && parts.has('UNTIL')) return false;

  if (parts.has('COUNT')) {
    const count = positiveInt(parts.get('COUNT'));
    if (count === null) return false;
    base.end = 'count';
    base.count = count;
    return true;
  }

  if (parts.has('UNTIL')) {
    const until = untilDateInput(parts.get('UNTIL')!);
    if (!until) return false;
    base.end = 'until';
    base.until = until;
  }
  return true;
}

function readByParts(parts: Map<string, string>): RuleParts | null {
  const rawByDay = parts.get('BYDAY');
  const rawByMonthDay = parts.get('BYMONTHDAY');
  const rawByMonth = parts.get('BYMONTH');

  const parsedByDay = rawByDay ? parseByDay(rawByDay) : undefined;
  if (rawByDay && !parsedByDay) return null;
  const byDay = parsedByDay ?? undefined;

  const byMonthDay = rawByMonthDay ? parseByMonthDay(rawByMonthDay) : undefined;
  if (byMonthDay === null) return null;

  const byMonth = rawByMonth ? parseByMonth(rawByMonth) : undefined;
  if (byMonth === null) return null;

  return { rawByDay, rawByMonthDay, rawByMonth, byDay, byMonthDay, byMonth };
}

function applyDaily(by: RuleParts): boolean {
  return !by.byDay && by.byMonthDay === undefined && by.byMonth === undefined;
}

function applyWeekly(base: RecurrenceDraft, by: RuleParts, anchor: Date): boolean {
  if (by.byMonthDay !== undefined || by.byMonth !== undefined) return false;
  if (!by.byDay) {
    base.weekdays = [anchor.getDay()];
    return true;
  }
  if (by.byDay.some((spec) => spec.ordinal !== 0)) return false;
  base.weekdays = [...new Set(by.byDay.map((spec) => spec.day))];
  return true;
}

function applyMonthly(base: RecurrenceDraft, by: RuleParts, anchor: Date): boolean {
  if (by.byMonth !== undefined || (by.byDay && by.rawByMonthDay)) return false;

  if (!by.byDay) {
    base.monthlyPattern = 'day';
    base.monthDay = by.byMonthDay ?? anchor.getDate();
    return true;
  }

  if (by.byDay.length !== 1) return false;
  const [spec] = by.byDay;
  base.monthlyPattern = 'weekday';
  base.monthOrdinal = spec.ordinal;
  base.monthWeekday = spec.day;
  return true;
}

function applyYearly(base: RecurrenceDraft, by: RuleParts, anchor: Date): boolean {
  if (by.byDay) {
    if (by.byMonth === undefined || by.rawByMonthDay || by.byDay.length !== 1) return false;
    const [spec] = by.byDay;
    base.yearlyPattern = 'weekday';
    base.yearMonth = by.byMonth - 1;
    base.yearOrdinal = spec.ordinal;
    base.yearWeekday = spec.day;
    return true;
  }

  base.yearlyPattern = 'date';
  base.yearMonth = by.byMonth !== undefined ? by.byMonth - 1 : anchor.getMonth();
  base.yearDay = by.byMonthDay ?? anchor.getDate();
  return true;
}

function applyPattern(base: RecurrenceDraft, by: RuleParts, anchor: Date): boolean {
  switch (base.frequency) {
    case 'daily':
      return applyDaily(by);
    case 'weekly':
      return applyWeekly(base, by, anchor);
    case 'monthly':
      return applyMonthly(base, by, anchor);
    case 'yearly':
      return applyYearly(base, by, anchor);
    default:
      return false;
  }
}

/**
 * Turns an RFC 5545 RRULE into the structured shape used by the builder.
 * Rules the builder cannot represent fall back to `custom`, preserving the
 * original text so nothing is silently lost.
 */
export function recurrenceFromRRule(
  rule: string,
  anchor: Date,
  fallback: RecurrenceFrequency = 'none',
): RecurrenceDraft {
  const base = defaultRecurrence(anchor, fallback);
  const normalized = rule
    .trim()
    .replace(/^RRULE:/i, '')
    .trim();
  if (!normalized) return base;

  const asCustom = (): RecurrenceDraft => ({
    ...base,
    frequency: 'custom',
    custom: normalized,
  });

  const parts = splitRule(normalized);
  if (!parts || !hasOnlyAllowedKeys(parts)) return asCustom();

  const frequency = parseFrequency(parts.get('FREQ'));
  if (!frequency) return asCustom();
  base.frequency = frequency;

  const interval = positiveInt(parts.get('INTERVAL'));
  if (interval === null) return asCustom();
  base.interval = interval;

  const weekStart = parts.get('WKST');
  if (weekStart !== undefined) {
    if (!(weekStart in dayIndexByCode)) return asCustom();
    base.weekStart = weekStart;
  }

  if (!applyEnd(base, parts)) return asCustom();

  const by = readByParts(parts);
  if (!by || !applyPattern(base, by, anchor)) return asCustom();

  return base;
}
