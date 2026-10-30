import { monthNames, weekdayNames } from './constants.ts';
import { parseByDay, parseByMonth, parseByMonthDay, positiveInt, splitRule } from './parse.ts';

function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

function ordinalWord(value: number): string {
  switch (value) {
    case -1:
      return 'last';
    case 1:
      return 'first';
    case 2:
      return 'second';
    case 3:
      return 'third';
    case 4:
      return 'fourth';
    default:
      return 'every';
  }
}

function dayOfMonthLabel(value: number): string {
  if (value === -1) return 'last day';
  const mod100 = value % 100;
  const suffix =
    mod100 >= 11 && mod100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[value % 10] ?? 'th');
  return `${value}${suffix}`;
}

function weekdayDetail(spec: { ordinal: number; day: number }): string {
  return spec.ordinal === 0
    ? `every ${weekdayNames[spec.day]}`
    : `the ${ordinalWord(spec.ordinal)} ${weekdayNames[spec.day]}`;
}

function formatUntil(value: string): string {
  const match = /^(\d{4})(\d{2})(\d{2})/.exec(value);
  if (!match) return value;
  return `${match[3]}/${match[2]}/${match[1]}`;
}

function monthlyPhrase(interval: number, detail: string): string {
  return interval === 1 ? `Monthly on ${detail}` : `Every ${interval} months on ${detail}`;
}

function yearlyPhrase(interval: number): string {
  return interval === 1 ? 'Yearly' : `Every ${interval} years`;
}

function describeDaily(parts: Map<string, string>, interval: number): string | null {
  if (parts.has('BYDAY') || parts.has('BYMONTHDAY') || parts.has('BYMONTH')) return null;
  return interval === 1 ? 'Every day' : `Every ${interval} days`;
}

function describeWeekly(parts: Map<string, string>, interval: number): string | null {
  if (parts.has('BYMONTHDAY') || parts.has('BYMONTH')) return null;

  const rawByDay = parts.get('BYDAY');
  const byDay = rawByDay ? parseByDay(rawByDay) : undefined;
  if (rawByDay && (!byDay || byDay.some((spec) => spec.ordinal !== 0))) return null;

  if (!byDay || byDay.length === 0) {
    return interval === 1 ? 'Every week' : `Every ${interval} weeks`;
  }

  const days = joinNames(byDay.map((spec) => weekdayNames[spec.day]));
  return interval === 1 ? `Weekly on ${days}` : `Every ${interval} weeks on ${days}`;
}

function describeMonthly(parts: Map<string, string>, interval: number): string | null {
  if (parts.has('BYMONTH')) return null;

  const rawByDay = parts.get('BYDAY');
  const rawByMonthDay = parts.get('BYMONTHDAY');
  if (rawByDay && rawByMonthDay) return null;

  if (rawByDay) {
    const byDay = parseByDay(rawByDay);
    if (!byDay || byDay.length !== 1) return null;
    return monthlyPhrase(interval, weekdayDetail(byDay[0]));
  }

  if (rawByMonthDay) {
    const monthDay = parseByMonthDay(rawByMonthDay);
    if (monthDay === null) return null;
    return monthlyPhrase(interval, `the ${dayOfMonthLabel(monthDay)}`);
  }

  return interval === 1 ? 'Monthly' : `Every ${interval} months`;
}

function describeYearlyByDay(
  rawByDay: string,
  month: number | undefined,
  rawByMonthDay: string | undefined,
  interval: number,
): string | null {
  if (month === undefined || rawByMonthDay) return null;
  const byDay = parseByDay(rawByDay);
  if (!byDay || byDay.length !== 1) return null;
  return `${yearlyPhrase(interval)} on ${weekdayDetail(byDay[0])} of ${monthNames[month - 1]}`;
}

function describeYearlyByMonth(
  month: number,
  rawByMonthDay: string | undefined,
  interval: number,
): string | null {
  if (rawByMonthDay) {
    const monthDay = parseByMonthDay(rawByMonthDay);
    if (monthDay === null) return null;
    return `${yearlyPhrase(interval)} on the ${dayOfMonthLabel(monthDay)} of ${
      monthNames[month - 1]
    }`;
  }
  return `${yearlyPhrase(interval)} in ${monthNames[month - 1]}`;
}

function describeYearlyByMonthDay(rawByMonthDay: string, interval: number): string | null {
  const monthDay = parseByMonthDay(rawByMonthDay);
  if (monthDay === null) return null;
  return `${yearlyPhrase(interval)} on the ${dayOfMonthLabel(monthDay)}`;
}

function describeYearly(parts: Map<string, string>, interval: number): string | null {
  const rawByDay = parts.get('BYDAY');
  const rawByMonth = parts.get('BYMONTH');
  const rawByMonthDay = parts.get('BYMONTHDAY');
  const month = rawByMonth ? parseByMonth(rawByMonth) : undefined;
  if (month === null) return null;

  if (rawByDay) return describeYearlyByDay(rawByDay, month, rawByMonthDay, interval);
  if (month !== undefined) return describeYearlyByMonth(month, rawByMonthDay, interval);
  if (rawByMonthDay) return describeYearlyByMonthDay(rawByMonthDay, interval);
  return yearlyPhrase(interval);
}

function describeFrequency(parts: Map<string, string>, interval: number): string | null {
  switch (parts.get('FREQ')) {
    case 'DAILY':
      return describeDaily(parts, interval);
    case 'WEEKLY':
      return describeWeekly(parts, interval);
    case 'MONTHLY':
      return describeMonthly(parts, interval);
    case 'YEARLY':
      return describeYearly(parts, interval);
    default:
      return null;
  }
}

function withLimit(base: string, parts: Map<string, string>): string {
  const rawCount = parts.get('COUNT');
  if (rawCount) {
    const count = positiveInt(rawCount);
    if (count !== null) {
      return `${base}, for ${count} ${count === 1 ? 'occurrence' : 'occurrences'}`;
    }
  }

  const rawUntil = parts.get('UNTIL');
  if (rawUntil) return `${base}, until ${formatUntil(rawUntil)}`;
  return base;
}

export function describeRRule(rule: string): string {
  const normalized = rule.trim();
  if (!normalized) return 'Does not repeat';

  const parts = splitRule(normalized);
  if (!parts) return rule;

  const interval = positiveInt(parts.get('INTERVAL')) ?? 1;
  const base = describeFrequency(parts, interval);
  return base === null ? rule : withLimit(base, parts);
}
