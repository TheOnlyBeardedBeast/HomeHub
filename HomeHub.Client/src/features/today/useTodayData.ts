import { addDays, addMonths, startOfMonth, startOfWeek } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { useCurrentUser } from '../../api/hooks/useCurrentUser';
import { useEvents } from '../../api/hooks/useEvents';
import { useLists } from '../../api/hooks/useLists';
import { useNotes } from '../../api/hooks/useNotes';
import { useQuote } from '../../api/hooks/useQuote';
import { useTasksInRange } from '../../api/hooks/useTasksInRange';
import { useWeather } from '../../api/hooks/useWeather';
import { toDate } from '../../lib/format';
import { usePeople } from '../../lib/people';
import {
  countEventsBetween,
  earliest,
  eventsBetween,
  firstNameFor,
  latest,
  nextUpcoming,
} from './todayData';

export function useTodayData() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  const dayStart = useMemo(() => {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return start;
  }, [now]);
  const dayEnd = useMemo(() => {
    const end = new Date(dayStart);
    end.setDate(end.getDate() + 1);
    return end;
  }, [dayStart]);
  // One fetch covers today, this week and this month — the next-thing line and
  // the footer counts all read from it.
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 7);
  const monthStart = startOfMonth(now);
  const monthEnd = addMonths(monthStart, 1);
  const eventsStart = earliest(weekStart, monthStart);
  const eventsEnd = latest(weekEnd, monthEnd);

  const currentUser = useCurrentUser();
  const events = useEvents(eventsStart, eventsEnd);
  const tasks = useTasksInRange(dayStart, dayEnd);
  const notes = useNotes('');
  const lists = useLists();
  const weather = useWeather();
  const quote = useQuote();
  const { nameFor } = usePeople();

  // A shared display is named after its room ("Kitchen"), not a person — leave
  // it out of the greeting.
  const firstName = firstNameFor(currentUser.data?.user);
  const openTasks = (tasks.data ?? []).filter((task) => !task.done);
  const doneTasks = (tasks.data ?? []).filter((task) => task.done);
  const latestNote = (notes.data ?? [])[0];
  const topList = (lists.data ?? [])[0];
  const allEvents = events.data ?? [];
  const todayEvents = eventsBetween(allEvents, dayStart, dayEnd);
  // An all-day event today is already under way, so only strictly upcoming
  // starts qualify for the next-thing line.
  const nextEvent = nextUpcoming(allEvents, now);
  const nextStart = nextEvent ? toDate(nextEvent.start) : undefined;
  const weekCount = countEventsBetween(allEvents, weekStart, weekEnd);
  const monthCount = countEventsBetween(allEvents, monthStart, monthEnd);
  const eventCount = todayEvents.length;

  return {
    now,
    firstName,
    events,
    tasks,
    notes,
    lists,
    weather,
    quote,
    nameFor,
    openTasks,
    doneTasks,
    latestNote,
    topList,
    todayEvents,
    nextEvent,
    nextStart,
    eventCount,
    weekCount,
    monthCount,
  };
}

export type TodayData = ReturnType<typeof useTodayData>;
