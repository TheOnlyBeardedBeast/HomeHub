import * as stylex from '@stylexjs/stylex';
import { format, isSameDay, isToday, startOfDay } from 'date-fns';
import { useEffect, useRef } from 'react';
import { CategoryDot } from '../../components/ui/CategoryChip';
import type { SimplifiedEvent } from '../../gen/events_pb';
import { dayKey, formatTime, toDate } from '../../lib/format';
import { layoutOverlaps, type TimelineItem } from '../../lib/timeline';
import { colors, fonts, motion } from '../../styles/tokens.stylex';
import { EventPill } from './EventBits';

const HOUR_HEIGHT = 48;
const DAY_MIN_WIDTH = 76;
const GUTTER_WIDTH = 56;
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const hourLabels = HOURS.map((hour) => format(new Date(2000, 0, 1, hour), 'HH:mm'));

const styles = stylex.create({
  scroller: {
    maxHeight: '640px',
    overflow: 'auto',
    overscrollBehavior: 'contain',
    backgroundColor: colors.surfaceRaised,
  },
  head: {
    position: 'sticky',
    top: 0,
    zIndex: 3,
    display: 'grid',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
    backgroundColor: colors.surfaceSunken,
  },
  headGutter: {
    position: 'sticky',
    left: 0,
    zIndex: 1,
    backgroundColor: colors.surfaceSunken,
  },
  headCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    minWidth: 0,
    padding: '7px 6px',
    borderLeftWidth: '1px',
    borderLeftStyle: 'solid',
    borderLeftColor: colors.border,
  },
  headCellSelected: { backgroundColor: colors.accentWash },
  headButton: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '5px',
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
  },
  headWeekday: {
    fontFamily: fonts.sans,
    fontSize: '9.5px',
    fontWeight: 680,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: colors.inkMuted,
  },
  headDate: {
    fontFamily: fonts.display,
    fontSize: '16px',
    fontWeight: 560,
    letterSpacing: '-0.02em',
    color: colors.ink,
  },
  headDateToday: { color: colors.accentInk },
  allDay: { display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 },
  body: { display: 'grid' },
  gutter: {
    position: 'sticky',
    left: 0,
    zIndex: 2,
    backgroundColor: colors.surfaceSunken,
  },
  gutterLabel: {
    display: 'block',
    height: '48px',
    paddingTop: '3px',
    paddingRight: '7px',
    textAlign: 'right',
    fontFamily: fonts.sans,
    fontSize: '9.5px',
    fontVariantNumeric: 'tabular-nums',
    color: colors.inkFaint,
  },
  column: {
    position: 'relative',
    borderLeftWidth: '1px',
    borderLeftStyle: 'solid',
    borderLeftColor: colors.border,
  },
  hourCell: {
    height: '48px',
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
    ':first-child': { borderTopWidth: 0 },
  },
  event: {
    position: 'absolute',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    overflow: 'hidden',
    paddingBlock: '2px',
    paddingInline: '4px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.borderStrong,
    borderRadius: '6px',
    backgroundColor: colors.surfaceRaised,
    color: colors.ink,
    textAlign: 'left',
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(45, 40, 31, 0.06)',
    transitionProperty: 'background-color, border-color',
    transitionDuration: motion.fast,
    ':hover': { backgroundColor: colors.accentWash, borderColor: colors.accent },
  },
  eventTime: {
    fontFamily: fonts.sans,
    fontSize: '9px',
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: colors.inkMuted,
    whiteSpace: 'nowrap',
  },
  eventTitleRow: { display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0 },
  eventTitle: {
    fontFamily: fonts.sans,
    fontSize: '10.5px',
    fontWeight: 580,
    lineHeight: 1.25,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
});

function timedItems(events: SimplifiedEvent[], day: Date): TimelineItem<SimplifiedEvent>[] {
  const dayStart = startOfDay(day).getTime();
  return events.flatMap((event) => {
    if (event.allDay) return [];
    const startDate = toDate(event.start);
    if (!startDate) return [];

    const start = Math.max(0, (startDate.getTime() - dayStart) / 60_000);
    const endDate = toDate(event.end);
    const rawEnd = endDate ? (endDate.getTime() - dayStart) / 60_000 : start + 30;
    const end = Math.min(1440, Math.max(rawEnd, start + 15));

    return [{ item: event, start, end }];
  });
}

export function TimelineView({
  days,
  grouped,
  selected,
  onSelect,
  onOpen,
}: {
  days: Date[];
  grouped: Map<string, SimplifiedEvent[]>;
  selected: Date;
  onSelect: (day: Date) => void;
  onOpen: (event: SimplifiedEvent) => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = scroller.current;
    if (!element) return;
    element.scrollTop = Math.max(0, new Date().getHours() - 1) * HOUR_HEIGHT;
  }, [days.length]);

  const columns = `${GUTTER_WIDTH}px repeat(${days.length}, minmax(0, 1fr))`;

  return (
    <div
      ref={scroller}
      role="group"
      aria-label="Calendar timeline"
      {...stylex.props(styles.scroller)}
    >
      <div style={{ minWidth: `${days.length * DAY_MIN_WIDTH + GUTTER_WIDTH}px` }}>
        <div {...stylex.props(styles.head)} style={{ gridTemplateColumns: columns }}>
          <span {...stylex.props(styles.headGutter)} />
          {days.map((day) => {
            const key = dayKey(day);
            const allDay = (grouped.get(key) ?? []).filter((event) => event.allDay);
            const isSelected = isSameDay(day, selected);

            return (
              <div
                key={key}
                {...stylex.props(styles.headCell, isSelected && styles.headCellSelected)}
              >
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onSelect(day)}
                  {...stylex.props(styles.headButton)}
                >
                  <span {...stylex.props(styles.headWeekday)}>{format(day, 'EEE')}</span>
                  <span {...stylex.props(styles.headDate, isToday(day) && styles.headDateToday)}>
                    {format(day, 'd')}
                  </span>
                </button>
                <div {...stylex.props(styles.allDay)}>
                  {allDay.map((event, index) => (
                    <EventPill
                      key={`${event.id}-${event.start?.seconds ?? index}`}
                      event={event}
                      onOpen={() => onOpen(event)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div {...stylex.props(styles.body)} style={{ gridTemplateColumns: columns }}>
          <div {...stylex.props(styles.gutter)}>
            {hourLabels.map((label, hour) => (
              <span key={hour} {...stylex.props(styles.gutterLabel)}>
                {label}
              </span>
            ))}
          </div>

          {days.map((day) => {
            const placed = layoutOverlaps(timedItems(grouped.get(dayKey(day)) ?? [], day));

            return (
              <div key={dayKey(day)} {...stylex.props(styles.column)}>
                {HOURS.map((hour) => (
                  <div key={hour} {...stylex.props(styles.hourCell)} />
                ))}

                {placed.map(({ item: event, start, end, column, columns: sideBySide }) => {
                  const height = Math.max(22, ((end - start) / 60) * HOUR_HEIGHT);
                  const startDate = toDate(event.start);

                  return (
                    <button
                      key={`${event.id}-${event.start?.seconds ?? start}`}
                      type="button"
                      title={`${startDate ? formatTime(startDate) : ''} · ${event.title}`}
                      onClick={() => onOpen(event)}
                      style={{
                        top: (start / 60) * HOUR_HEIGHT,
                        height,
                        left: `calc(${(column / sideBySide) * 100}% + 2px)`,
                        width: `calc(${100 / sideBySide}% - 4px)`,
                      }}
                      {...stylex.props(styles.event)}
                    >
                      {height >= 40 && startDate && (
                        <span {...stylex.props(styles.eventTime)}>{formatTime(startDate)}</span>
                      )}
                      <span {...stylex.props(styles.eventTitleRow)}>
                        <CategoryDot category={event.category} />
                        <span {...stylex.props(styles.eventTitle)}>{event.title}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
