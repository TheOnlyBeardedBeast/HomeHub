import * as stylex from '@stylexjs/stylex';
import { addDays, addMonths, startOfDay, startOfMonth, startOfWeek } from 'date-fns';
import { Download, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { apiBaseUrl } from '../api/clients';
import { useEvents } from '../api/hooks/useEvents';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';
import { CalendarSidebar } from '../features/calendar/CalendarSidebar';
import { CalendarToolbar } from '../features/calendar/CalendarToolbar';
import { eventsByDay, rangeLabel } from '../features/calendar/calendarData';
import { type CalendarView, viewDays } from '../features/calendar/calendarOptions';
import { EventDialog, type EventDialogTarget } from '../features/calendar/EventDialog';
import { MonthGrid } from '../features/calendar/MonthGrid';
import { TimelineView } from '../features/calendar/TimelineView';
import type { SimplifiedEvent } from '../gen/events_pb';
import { errorMessage } from '../lib/errors';
import { dayKey, toDate } from '../lib/format';
import { $apiKey } from '../lib/session';
import { toast } from '../lib/toasts';
import { colors, radius } from '../styles/tokens.stylex';

const styles = stylex.create({
  layout: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 310px',
    gap: '22px',
    alignItems: 'start',
    '@media (max-width: 1080px)': { gridTemplateColumns: 'minmax(0, 1fr)' },
  },
  calendarCard: {
    overflow: 'hidden',
    borderRadius: radius.lg,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.border,
    backgroundColor: colors.surface,
    boxShadow: '0 1px 2px rgba(45, 40, 31, 0.04), 0 8px 24px rgba(45, 40, 31, 0.045)',
  },
});

export function CalendarPage() {
  const today = useMemo(() => new Date(), []);
  const [view, setView] = useState<CalendarView>('month');
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState(() => new Date());
  const [dialog, setDialog] = useState<EventDialogTarget | null>(null);
  const [exporting, setExporting] = useState(false);

  const dayCount = viewDays[view];
  const rangeStart = useMemo(() => {
    if (view === 'month') return startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    if (view === 'week') return startOfWeek(cursor, { weekStartsOn: 1 });
    return startOfDay(cursor);
  }, [cursor, view]);
  const rangeEnd = useMemo(() => addDays(rangeStart, dayCount), [dayCount, rangeStart]);
  const events = useEvents(rangeStart, rangeEnd);
  const grouped = useMemo(() => eventsByDay(events.data), [events.data]);
  const selectedEvents = useMemo(() => {
    const list = grouped.get(dayKey(selected)) ?? [];
    return [...list].sort((a, b) => {
      if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
      return (toDate(a.start)?.getTime() ?? 0) - (toDate(b.start)?.getTime() ?? 0);
    });
  }, [grouped, selected]);

  const cells = useMemo(
    () => Array.from({ length: dayCount }, (_, index) => addDays(rangeStart, index)),
    [dayCount, rangeStart],
  );

  const rangeEndLabel = addDays(rangeStart, dayCount - 1);
  const label = rangeLabel(view, cursor, rangeStart, rangeEndLabel);

  function shiftView(direction: number) {
    if (view === 'month') {
      const next = addMonths(cursor, direction);
      setCursor(startOfMonth(next));
      setSelected(startOfMonth(next));
      return;
    }

    const next = addDays(rangeStart, direction * dayCount);
    setCursor(next);
    setSelected(next);
  }

  function goToday() {
    setCursor(today);
    setSelected(today);
  }

  function changeView(next: CalendarView) {
    setView(next);
    setCursor(next === 'month' ? startOfMonth(selected) : startOfDay(selected));
  }

  async function exportMonth() {
    setExporting(true);
    try {
      const start = startOfMonth(cursor);
      const end = addMonths(start, 1);
      const apiKey = $apiKey.get();
      const response = await fetch(
        `${apiBaseUrl}/api/events/ics?start=${encodeURIComponent(start.toISOString())}&end=${encodeURIComponent(end.toISOString())}`,
        { headers: apiKey ? { 'x-api-key': apiKey } : {} },
      );
      if (!response.ok) throw new Error('The calendar could not be exported.');
      const blob = await response.blob();
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = href;
      anchor.download = `homehub-${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}.ics`;
      anchor.click();
      URL.revokeObjectURL(href);
      toast('Calendar exported.', 'success');
    } catch (error) {
      toast(errorMessage(error), 'error');
    } finally {
      setExporting(false);
    }
  }

  function openEvent(event: SimplifiedEvent) {
    setDialog({ id: event.id, occurrence: toDate(event.start) });
  }

  return (
    <>
      <PageHeader
        eyebrow="The household calendar"
        title="Everything, in its place."
        description="The week ahead at a glance. Pick a day to see its shape, or add something new to the rhythm."
        actions={
          <>
            <Button
              variant="secondary"
              icon={<Download size={15} />}
              loading={exporting}
              onClick={exportMonth}
            >
              Export .ics
            </Button>
            <Button icon={<Plus size={15} />} onClick={() => setDialog({ initialDate: selected })}>
              New event
            </Button>
          </>
        }
      />

      <div {...stylex.props(styles.layout)}>
        <div {...stylex.props(styles.calendarCard)}>
          <CalendarToolbar
            label={label}
            view={view}
            onViewChange={changeView}
            onToday={goToday}
            onPrev={() => shiftView(-1)}
            onNext={() => shiftView(1)}
          />

          {view === 'month' ? (
            <MonthGrid
              cells={cells}
              grouped={grouped}
              cursor={cursor}
              selected={selected}
              onSelect={setSelected}
              onOpen={openEvent}
            />
          ) : (
            <TimelineView
              days={cells}
              grouped={grouped}
              selected={selected}
              onSelect={setSelected}
              onOpen={openEvent}
            />
          )}
        </div>

        <CalendarSidebar
          selected={selected}
          events={selectedEvents}
          pending={events.isPending}
          error={events.isError ? events.error : undefined}
          onOpen={openEvent}
          onAdd={() => setDialog({ initialDate: selected })}
          onRetry={() => events.refetch()}
        />
      </div>

      {dialog && <EventDialog target={dialog} onClose={() => setDialog(null)} />}
    </>
  );
}
