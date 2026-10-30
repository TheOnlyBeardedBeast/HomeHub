import * as stylex from '@stylexjs/stylex';
import { PageError } from '../../components/ui/PageError';
import type { SimplifiedEvent } from '../../gen/events_pb';
import { CalendarLegend } from './CalendarLegend';
import { sidebarStyles as styles } from './calendarSidebarStyles';
import { SelectedDayCard } from './SelectedDayCard';

export function CalendarSidebar({
  selected,
  events,
  pending,
  error,
  onOpen,
  onAdd,
  onRetry,
}: {
  selected: Date;
  events: SimplifiedEvent[];
  pending: boolean;
  error: unknown;
  onOpen: (event: SimplifiedEvent) => void;
  onAdd: () => void;
  onRetry: () => void;
}) {
  return (
    <aside {...stylex.props(styles.side)}>
      <SelectedDayCard
        selected={selected}
        events={events}
        pending={pending}
        onOpen={onOpen}
        onAdd={onAdd}
      />

      <CalendarLegend />

      {error ? <PageError error={error} onRetry={onRetry} /> : null}
    </aside>
  );
}
