import * as stylex from '@stylexjs/stylex';
import { CalendarDays, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { SectionHeader } from '../../components/ui/SectionHeader';
import type { SimplifiedEvent } from '../../gen/events_pb';
import { formatDay, formatTime } from '../../lib/format';
import { colors, fonts, motion, radius } from '../../styles/tokens.stylex';
import { EventAgendaRow } from '../calendar/EventBits';

const styles = stylex.create({
  rhythmCard: {
    display: 'flex',
    flexDirection: 'column',
  },
  // The scrollable part of the rhythm card; the summary below stays pinned to
  // the column's foot.
  rhythmBody: {
    flexGrow: 1,
    minHeight: 0,
    overflowX: 'hidden',
    overflowY: 'auto',
  },
  tasksMeta: {
    fontFamily: fonts.sans,
    fontSize: '11.5px',
    color: colors.inkMuted,
  },
  nextThing: {
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    paddingBlock: '8px',
    paddingInline: '10px',
    marginTop: '8px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.accentSoft,
    borderRadius: radius.md,
    backgroundColor: colors.accentWash,
    textAlign: 'left',
    transitionProperty: 'background-color',
    transitionDuration: motion.fast,
    ':hover': { backgroundColor: colors.accentSoft },
  },
  nextLabel: {
    fontFamily: fonts.sans,
    fontSize: '9.5px',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: colors.accentInk,
    whiteSpace: 'nowrap',
  },
  nextTitle: {
    fontFamily: fonts.sans,
    fontSize: '13px',
    fontWeight: 620,
    color: colors.ink,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  nextWhen: {
    fontFamily: fonts.sans,
    fontSize: '11px',
    fontWeight: 560,
    fontVariantNumeric: 'tabular-nums',
    color: colors.inkMuted,
    whiteSpace: 'nowrap',
  },
  summary: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'flex-start',
    gap: '16px',
    marginTop: '8px',
    paddingTop: '10px',
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
    fontFamily: fonts.sans,
    fontSize: '11px',
    color: colors.inkMuted,
  },
  summaryItem: { display: 'inline-flex', alignItems: 'baseline', gap: '5px' },
  summaryValue: {
    fontFamily: fonts.sans,
    fontSize: '12.5px',
    fontWeight: 650,
    fontVariantNumeric: 'tabular-nums',
    color: colors.ink,
  },
});

export function RhythmCard({
  events,
  nextEvent,
  nextStart,
  eventCount,
  weekCount,
  monthCount,
  onOpenEvent,
  onAdd,
  sectionSx,
  cardSx,
}: {
  events: SimplifiedEvent[];
  nextEvent?: SimplifiedEvent;
  nextStart?: Date;
  eventCount: number;
  weekCount: number;
  monthCount: number;
  onOpenEvent: (event: SimplifiedEvent) => void;
  onAdd: () => void;
  sectionSx?: stylex.StyleXStyles;
  cardSx?: stylex.StyleXStyles;
}) {
  return (
    <section {...stylex.props(sectionSx)}>
      <SectionHeader
        title="Today's rhythm"
        action={
          <span {...stylex.props(styles.tasksMeta)}>
            {eventCount === 0 ? 'Nothing scheduled' : `${eventCount} on the calendar`}
          </span>
        }
      />
      <Card padding="sm" sx={[cardSx, styles.rhythmCard]}>
        <div {...stylex.props(styles.rhythmBody)}>
          {events.length > 0 ? (
            events.map((event) => (
              <EventAgendaRow
                key={`${event.id}-${event.start?.seconds ?? ''}`}
                event={event}
                onOpen={() => onOpenEvent(event)}
              />
            ))
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="A clear day"
              description="No events on the calendar. Enjoy the quiet, or add something to look forward to."
              action={
                <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={onAdd}>
                  Add an event
                </Button>
              }
            />
          )}
          {nextEvent && nextStart && (
            <button
              type="button"
              onClick={() => onOpenEvent(nextEvent)}
              {...stylex.props(styles.nextThing)}
            >
              <span {...stylex.props(styles.nextLabel)}>Next thing</span>
              <span {...stylex.props(styles.nextTitle)}>{nextEvent.title}</span>
              <span {...stylex.props(styles.nextWhen)}>
                {formatDay(nextStart)} · {nextEvent.allDay ? 'All day' : formatTime(nextStart)}
              </span>
            </button>
          )}
        </div>
        <div {...stylex.props(styles.summary)}>
          <span {...stylex.props(styles.summaryItem)}>
            Week <span {...stylex.props(styles.summaryValue)}>{weekCount}</span>
          </span>
          <span {...stylex.props(styles.summaryItem)}>
            Month <span {...stylex.props(styles.summaryValue)}>{monthCount}</span>
          </span>
        </div>
      </Card>
    </section>
  );
}
