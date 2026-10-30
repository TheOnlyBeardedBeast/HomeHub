import * as stylex from '@stylexjs/stylex';
import type { SimplifiedEvent } from '../../gen/events_pb';
import { categoryLabel } from '../../lib/categories';
import { eventTimeLabel, formatTime, toDate } from '../../lib/format';
import { colors, fonts, motion, radius } from '../../styles/tokens.stylex';
import { CategoryDot } from '../../components/ui/CategoryChip';

const styles = stylex.create({
  row: {
    display: 'grid',
    gridTemplateColumns: '64px 14px minmax(0, 1fr)',
    alignItems: 'start',
    gap: '10px',
    width: 'calc(100% + 16px)',
    paddingBlock: '10px',
    paddingInline: '8px',
    marginInline: '-8px',
    borderWidth: 0,
    borderRadius: radius.md,
    backgroundColor: 'transparent',
    textAlign: 'left',
    transitionProperty: 'background-color',
    transitionDuration: motion.fast,
    ':hover': { backgroundColor: colors.surfaceSunken },
  },
  time: {
    fontFamily: fonts.sans,
    fontSize: '11px',
    fontWeight: 580,
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'right',
    color: colors.inkMuted,
    paddingTop: '1px',
  },
  rail: {
    position: 'relative',
    alignSelf: 'stretch',
    display: 'flex',
    justifyContent: 'center',
    paddingTop: '3px',
    '::before': {
      content: '""',
      position: 'absolute',
      top: '-10px',
      bottom: '-10px',
      left: '50%',
      width: '1px',
      backgroundColor: colors.border,
    },
  },
  dotHalo: {
    position: 'relative',
    zIndex: 1,
    display: 'grid',
    placeItems: 'center',
    width: '15px',
    height: '15px',
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  content: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 },
  title: {
    fontFamily: fonts.sans,
    fontSize: '13.5px',
    fontWeight: 570,
    letterSpacing: '-0.01em',
    color: colors.ink,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: fonts.sans,
    fontSize: '11.5px',
    color: colors.inkMuted,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  pill: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    width: '100%',
    paddingBlock: '3px',
    paddingInline: '5px',
    borderWidth: 0,
    borderRadius: '5px',
    backgroundColor: colors.surfaceSunken,
    fontFamily: fonts.sans,
    fontSize: '10.5px',
    fontWeight: 540,
    color: colors.inkSoft,
    textAlign: 'left',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    transitionProperty: 'background-color, color',
    transitionDuration: motion.fast,
    ':hover': { backgroundColor: colors.accentSoft, color: colors.accentInk },
  },
  pillTitle: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' },
});

export function EventAgendaRow({
  event,
  onOpen,
  showCategory = true,
}: {
  event: SimplifiedEvent;
  onOpen: () => void;
  showCategory?: boolean;
}) {
  const start = toDate(event.start);
  const end = toDate(event.end);
  const meta = [
    !event.allDay && end ? `until ${formatTime(end)}` : '',
    showCategory ? categoryLabel(event.category) : '',
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <button type="button" onClick={onOpen} {...stylex.props(styles.row)}>
      <span {...stylex.props(styles.time)}>
        {event.allDay ? 'All day' : start ? formatTime(start) : '—'}
      </span>
      <span {...stylex.props(styles.rail)}>
        <span {...stylex.props(styles.dotHalo)}>
          <CategoryDot category={event.category} />
        </span>
      </span>
      <span {...stylex.props(styles.content)}>
        <span {...stylex.props(styles.title)}>{event.title}</span>
        <span {...stylex.props(styles.meta)}>{meta}</span>
      </span>
    </button>
  );
}

export function EventPill({ event, onOpen }: { event: SimplifiedEvent; onOpen: () => void }) {
  const start = toDate(event.start);
  return (
    <button
      type="button"
      onClick={(clickEvent) => {
        clickEvent.stopPropagation();
        onOpen();
      }}
      title={`${eventTimeLabel(start, toDate(event.end), event.allDay)} · ${event.title}`}
      {...stylex.props(styles.pill)}
    >
      <CategoryDot category={event.category} />
      <span {...stylex.props(styles.pillTitle)}>
        {event.allDay ? '' : start ? `${formatTime(start)} ` : ''}
        {event.title}
      </span>
    </button>
  );
}
