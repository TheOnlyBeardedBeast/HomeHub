import { format, isSameMonth } from 'date-fns';
import type { SimplifiedEvent } from '../../gen/events_pb';
import { dayKey, formatMonth, toDate } from '../../lib/format';
import type { CalendarView } from './calendarOptions';

export function eventsByDay(events: SimplifiedEvent[] | undefined) {
  const map = new Map<string, SimplifiedEvent[]>();
  for (const event of events ?? []) {
    const start = toDate(event.start);
    if (!start) continue;
    const key = dayKey(start);
    const list = map.get(key);
    if (list) list.push(event);
    else map.set(key, [event]);
  }
  return map;
}

export function rangeLabel(
  view: CalendarView,
  cursor: Date,
  rangeStart: Date,
  rangeEnd: Date,
): string {
  if (view === 'month') return formatMonth(cursor);
  if (view === 'day') return format(rangeStart, 'EEEE d MMMM yyyy');
  if (isSameMonth(rangeStart, rangeEnd)) {
    return `${format(rangeStart, 'd')} – ${format(rangeEnd, 'd MMM yyyy')}`;
  }
  return `${format(rangeStart, 'd MMM')} – ${format(rangeEnd, 'd MMM yyyy')}`;
}
