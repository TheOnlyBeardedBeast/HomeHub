import type { SimplifiedEvent } from '../../gen/events_pb';
import { UserType, type User } from '../../gen/users_pb';
import { greeting, toDate } from '../../lib/format';

export function todayTitle(now: Date, firstName?: string): string {
  return `${greeting(now)}${firstName ? `, ${firstName}` : ''}.`;
}

export function firstNameFor(user?: User): string | undefined {
  if (!user) return undefined;
  if (user.type === UserType.DISPLAY) return undefined;
  return user.fullName?.trim().split(/\s+/)[0];
}

export function eventsBetween(events: SimplifiedEvent[], from: Date, to: Date): SimplifiedEvent[] {
  return events.filter((event) => {
    const start = toDate(event.start);
    return start !== undefined && start >= from && start < to;
  });
}

export function countEventsBetween(events: SimplifiedEvent[], from: Date, to: Date): number {
  return eventsBetween(events, from, to).length;
}

export function nextUpcoming(events: SimplifiedEvent[], now: Date): SimplifiedEvent | undefined {
  return events
    .filter((event) => {
      const start = toDate(event.start);
      return start !== undefined && start >= now;
    })
    .sort((a, b) => (toDate(a.start)?.getTime() ?? 0) - (toDate(b.start)?.getTime() ?? 0))[0];
}

export function earliest(a: Date, b: Date): Date {
  return a < b ? a : b;
}

export function latest(a: Date, b: Date): Date {
  return a > b ? a : b;
}
