import { dayCodes, weekOrder } from './constants.ts';
import type { RecurrenceDraft } from './types.ts';

function normalizeInt(value: number, fallback = 1): number {
  return Number.isFinite(value) && value >= 1 ? Math.floor(value) : fallback;
}

function untilStamp(value: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 23, 59, 59, 999);
  if (Number.isNaN(date.getTime())) return null;
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');
}

function daySpec(ordinal: number, weekday: number): string {
  return `${ordinal === 0 ? '' : ordinal}${dayCodes[weekday] ?? 'MO'}`;
}

function weeklyPart(value: RecurrenceDraft, anchor: Date): string {
  const selected = new Set(value.weekdays.filter((day) => day >= 0 && day <= 6));
  const days = selected.size ? weekOrder.filter((day) => selected.has(day)) : [anchor.getDay()];
  return `BYDAY=${days.map((day) => dayCodes[day]).join(',')}`;
}

function monthlyPart(value: RecurrenceDraft): string {
  if (value.monthlyPattern === 'weekday') {
    return `BYDAY=${daySpec(value.monthOrdinal, value.monthWeekday)}`;
  }
  return `BYMONTHDAY=${value.monthDay}`;
}

function yearlyParts(value: RecurrenceDraft): string[] {
  const parts = [`BYMONTH=${value.yearMonth + 1}`];
  if (value.yearlyPattern === 'weekday') {
    parts.push(`BYDAY=${daySpec(value.yearOrdinal, value.yearWeekday)}`);
  } else {
    parts.push(`BYMONTHDAY=${value.yearDay}`);
  }
  return parts;
}

function patternParts(value: RecurrenceDraft, anchor: Date): string[] {
  switch (value.frequency) {
    case 'weekly':
      return [weeklyPart(value, anchor)];
    case 'monthly':
      return [monthlyPart(value)];
    case 'yearly':
      return yearlyParts(value);
    default:
      return [];
  }
}

function endPart(value: RecurrenceDraft): string | undefined {
  if (value.end === 'until') {
    const until = untilStamp(value.until);
    return until ? `UNTIL=${until}` : undefined;
  }
  if (value.end === 'count') return `COUNT=${normalizeInt(value.count)}`;
  return undefined;
}

export function recurrenceToRRule(value: RecurrenceDraft, anchor: Date): string {
  if (value.frequency === 'none') return '';
  if (value.frequency === 'custom') {
    return value.custom
      .trim()
      .replace(/^RRULE:/i, '')
      .toUpperCase();
  }

  const interval = normalizeInt(value.interval);
  const parts = [`FREQ=${value.frequency.toUpperCase()}`];
  if (interval > 1) parts.push(`INTERVAL=${interval}`);
  if (value.weekStart !== 'MO') parts.push(`WKST=${value.weekStart}`);
  parts.push(...patternParts(value, anchor));

  const end = endPart(value);
  if (end) parts.push(end);

  return parts.join(';');
}
