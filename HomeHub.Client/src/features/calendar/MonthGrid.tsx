import * as stylex from '@stylexjs/stylex';
import { isSameDay, isSameMonth } from 'date-fns';
import type { SimplifiedEvent } from '../../gen/events_pb';
import { dayKey } from '../../lib/format';
import { colors, fonts } from '../../styles/tokens.stylex';
import { MonthCell } from './MonthCell';
import { weekdays } from './calendarOptions';

const styles = stylex.create({
  weekdays: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
    backgroundColor: colors.surfaceSunken,
  },
  weekday: {
    paddingBlock: '8px',
    textAlign: 'center',
    fontFamily: fonts.sans,
    fontSize: '10px',
    fontWeight: 680,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: colors.inkMuted,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
  },
});

export function MonthGrid({
  cells,
  grouped,
  cursor,
  selected,
  onSelect,
  onOpen,
}: {
  cells: Date[];
  grouped: Map<string, SimplifiedEvent[]>;
  cursor: Date;
  selected: Date;
  onSelect: (day: Date) => void;
  onOpen: (event: SimplifiedEvent) => void;
}) {
  return (
    <>
      <div {...stylex.props(styles.weekdays)} aria-hidden="true">
        {weekdays.map((day) => (
          <span key={day} {...stylex.props(styles.weekday)}>
            {day}
          </span>
        ))}
      </div>

      <div role="grid" {...stylex.props(styles.grid)}>
        {cells.map((day) => (
          <MonthCell
            key={dayKey(day)}
            day={day}
            events={grouped.get(dayKey(day)) ?? []}
            outside={!isSameMonth(day, cursor)}
            selected={isSameDay(day, selected)}
            onSelect={onSelect}
            onOpen={onOpen}
          />
        ))}
      </div>
    </>
  );
}
