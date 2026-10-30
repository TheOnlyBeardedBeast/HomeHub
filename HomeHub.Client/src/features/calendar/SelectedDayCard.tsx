import * as stylex from '@stylexjs/stylex';
import { isToday } from 'date-fns';
import { Plus } from 'lucide-react';
import { Button, IconButton } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import type { SimplifiedEvent } from '../../gen/events_pb';
import { formatLongDate } from '../../lib/format';
import { sidebarStyles as styles } from './calendarSidebarStyles';
import { EventAgendaRow } from './EventBits';

export function SelectedDayCard({
  selected,
  events,
  pending,
  onOpen,
  onAdd,
}: {
  selected: Date;
  events: SimplifiedEvent[];
  pending: boolean;
  onOpen: (event: SimplifiedEvent) => void;
  onAdd: () => void;
}) {
  return (
    <Card padding="md">
      <span {...stylex.props(styles.sideSub)}>{isToday(selected) ? 'Today' : 'Selected day'}</span>
      <div {...stylex.props(styles.sideHeader)}>
        <h2 {...stylex.props(styles.sideDate)}>{formatLongDate(selected)}</h2>
        <IconButton label="Add event on this day" size="sm" variant="secondary" onClick={onAdd}>
          <Plus size={15} />
        </IconButton>
      </div>

      {pending ? (
        <p {...stylex.props(styles.sideEmpty)}>Loading the day…</p>
      ) : events.length > 0 ? (
        events.map((event, index) => (
          <EventAgendaRow
            key={`${event.id}-${event.start?.seconds ?? index}`}
            event={event}
            onOpen={() => onOpen(event)}
          />
        ))
      ) : (
        <>
          <p {...stylex.props(styles.sideEmpty)}>
            Nothing on the calendar for this day. A little breathing room.
          </p>
          <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={onAdd}>
            Add an event
          </Button>
        </>
      )}
    </Card>
  );
}
