import * as stylex from '@stylexjs/stylex';
import { isToday } from 'date-fns';
import { CategoryDot } from '../../components/ui/CategoryChip';
import type { SimplifiedEvent } from '../../gen/events_pb';
import { formatLongDate } from '../../lib/format';
import { colors, fonts, motion, radius } from '../../styles/tokens.stylex';
import { EventPill } from './EventBits';

const styles = stylex.create({
  cell: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '4px',
    minHeight: '112px',
    padding: '6px',
    borderLeftWidth: '1px',
    borderLeftStyle: 'solid',
    borderLeftColor: colors.border,
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
    backgroundColor: colors.surfaceRaised,
    textAlign: 'left',
    transitionProperty: 'background-color',
    transitionDuration: motion.fast,
    ':nth-child(7n + 1)': { borderLeftWidth: 0 },
    ':nth-child(-n + 7)': { borderTopWidth: 0 },
    ':hover': { backgroundColor: colors.canvas },
    '@media (max-width: 700px)': {
      minHeight: '62px',
      padding: '4px',
      gap: '3px',
    },
  },
  cellOutside: {
    backgroundColor: colors.canvas,
    ':hover': { backgroundColor: colors.surfaceSunken },
  },
  cellSelected: {
    backgroundColor: colors.accentWash,
    ':hover': { backgroundColor: colors.accentWash },
  },
  dayNumberRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '4px',
  },
  dayNumber: {
    display: 'grid',
    placeItems: 'center',
    width: '23px',
    height: '23px',
    padding: 0,
    borderWidth: 0,
    borderRadius: radius.pill,
    backgroundColor: 'transparent',
    fontFamily: fonts.sans,
    fontSize: '11.5px',
    fontWeight: 580,
    fontVariantNumeric: 'tabular-nums',
    color: colors.inkSoft,
    ':hover': { backgroundColor: colors.surfaceSunken },
    '@media (max-width: 700px)': { width: '21px', height: '21px', fontSize: '11px' },
  },
  dayNumberOutside: { color: colors.inkFaint },
  dayNumberToday: { color: colors.accentInk, fontWeight: 720 },
  dayNumberSelected: { backgroundColor: colors.accent, color: colors.onAccent, fontWeight: 650 },
  pills: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
    '@media (max-width: 700px)': { display: 'none' },
  },
  more: {
    paddingInline: '5px',
    fontFamily: fonts.sans,
    fontSize: '9.5px',
    fontWeight: 540,
    color: colors.inkMuted,
  },
  dots: {
    display: 'none',
    alignItems: 'center',
    gap: '3px',
    paddingInline: '3px',
    '@media (max-width: 700px)': { display: 'flex' },
  },
});

export function MonthCell({
  day,
  events,
  outside,
  selected,
  onSelect,
  onOpen,
}: {
  day: Date;
  events: SimplifiedEvent[];
  outside: boolean;
  selected: boolean;
  onSelect: (day: Date) => void;
  onOpen: (event: SimplifiedEvent) => void;
}) {
  return (
    <div
      role="gridcell"
      aria-selected={selected}
      onClick={() => onSelect(day)}
      {...stylex.props(styles.cell, outside && styles.cellOutside, selected && styles.cellSelected)}
    >
      <span {...stylex.props(styles.dayNumberRow)}>
        <button
          type="button"
          aria-label={`Select ${formatLongDate(day)}`}
          aria-pressed={selected}
          onClick={(event) => {
            event.stopPropagation();
            onSelect(day);
          }}
          {...stylex.props(
            styles.dayNumber,
            outside && styles.dayNumberOutside,
            isToday(day) && styles.dayNumberToday,
            selected && styles.dayNumberSelected,
          )}
        >
          {day.getDate()}
        </button>
      </span>

      <span {...stylex.props(styles.pills)}>
        {events.slice(0, 2).map((event, index) => (
          <EventPill
            key={`${event.id}-${event.start?.seconds ?? index}`}
            event={event}
            onOpen={() => onOpen(event)}
          />
        ))}
        {events.length > 2 && <span {...stylex.props(styles.more)}>+{events.length - 2} more</span>}
      </span>

      <span {...stylex.props(styles.dots)}>
        {events.slice(0, 3).map((event, index) => (
          <CategoryDot key={`${event.id}-${index}`} category={event.category} />
        ))}
      </span>
    </div>
  );
}
