import type { EventDraft } from '../../api/hooks/useSaveEvent';
import type { Event as EventMessage } from '../../gen/events_pb';
import { categoryKey } from '../../lib/categories';
import { fromDateInput, toDate, toDateInput, toTimeInput } from '../../lib/format';
import {
  defaultRecurrence,
  recurrenceFromRRule,
  recurrenceToRRule,
  type RecurrenceDraft,
} from '../../lib/rrules';

export interface EventDialogTarget {
  id?: string;
  /** The occurrence the user clicked; used for skipping a single repeat. */
  occurrence?: Date;
  initialDate?: Date;
}

export interface EventFormValues {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  category: string;
  recurrence: RecurrenceDraft;
}

function nineAm(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(9, 0, 0, 0);
  return copy;
}

export function valuesFrom(event: EventMessage | undefined, initialDate?: Date): EventFormValues {
  if (!event) {
    const start = nineAm(initialDate ?? new Date());
    const end = new Date(start);
    end.setHours(10);
    return {
      title: '',
      description: '',
      date: toDateInput(start),
      startTime: toTimeInput(start),
      endTime: toTimeInput(end),
      allDay: false,
      category: 'family',
      recurrence: defaultRecurrence(start, 'none'),
    };
  }

  const start = toDate(event.start) ?? new Date();
  const end = toDate(event.end);
  return {
    title: event.title,
    description: event.description ?? '',
    date: toDateInput(start),
    startTime: toTimeInput(start),
    endTime: end ? toTimeInput(end) : '',
    allDay: event.allDay,
    category: categoryKey(event.category),
    recurrence: recurrenceFromRRule(event.rrules[0] ?? '', start),
  };
}

function combine(date: string, time: string): Date {
  const day = fromDateInput(date || toDateInput(new Date()));
  const [hours, minutes] = (time || '09:00').split(':').map(Number);
  day.setHours(hours || 0, minutes || 0, 0, 0);
  return day;
}

export const timePattern = /^([01]?\d|2[0-3]):[0-5]\d$/;

export function draftFromValues(value: EventFormValues, event?: EventMessage): EventDraft {
  const start = value.allDay ? fromDateInput(value.date) : combine(value.date, value.startTime);
  let end: Date | undefined;
  if (!value.allDay) {
    end = combine(value.date, value.endTime || value.startTime);
    if (end.getTime() <= start.getTime()) end.setDate(end.getDate() + 1);
  }

  const rule = recurrenceToRRule(value.recurrence, start);

  return {
    id: event?.id,
    title: value.title,
    description: value.description,
    start,
    end,
    category: value.category,
    allDay: value.allDay,
    rrules: rule ? [rule] : [],
    exceptDates: (event?.exceptDates ?? [])
      .map((stamp) => toDate(stamp))
      .filter((date): date is Date => Boolean(date)),
  };
}
