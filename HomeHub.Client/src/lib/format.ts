import { timestampDate, timestampFromDate } from '@bufbuild/protobuf/wkt';
import type { Timestamp } from '@bufbuild/protobuf/wkt';
import {
  differenceInSeconds,
  format,
  formatDistanceToNowStrict,
  isToday,
  isTomorrow,
  isYesterday,
  startOfDay,
} from 'date-fns';

export function toDate(value?: Timestamp): Date | undefined {
  return value ? timestampDate(value) : undefined;
}

export function toTimestamp(date: Date): Timestamp {
  return timestampFromDate(date);
}

export function formatTime(date: Date): string {
  return format(date, 'HH:mm');
}

export function formatDay(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'EEE, d MMM');
}

export function formatLongDate(date: Date): string {
  return format(date, 'EEEE, d MMMM');
}

export function formatMonth(date: Date): string {
  return format(date, 'MMMM yyyy');
}

export function formatRelative(date: Date): string {
  if (Math.abs(differenceInSeconds(new Date(), date)) < 60) return 'just now';
  return formatDistanceToNowStrict(date, { addSuffix: true });
}

export function formatMonthDay(date: Date): string {
  return format(date, 'd MMM');
}

export function formatWeekday(date: Date): string {
  return format(date, 'EEE');
}

export function dayKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function toDateTimeInput(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

export function toTimeInput(date: Date): string {
  return format(date, 'HH:mm');
}

export function toDateInput(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function fromDateTimeInput(value: string): Date {
  return new Date(value);
}

export function fromDateInput(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function greeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function startOfToday(): Date {
  return startOfDay(new Date());
}

export function eventTimeLabel(start?: Date, end?: Date, allDay = false): string {
  if (!start) return 'No time';
  if (allDay) return 'All day';
  if (!end) return formatTime(start);
  return `${formatTime(start)} – ${formatTime(end)}`;
}

export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}
