import * as stylex from '@stylexjs/stylex';
import type { NoteMessage } from '../../api/hooks/useNotes';
import type { TaskMessage } from '../../api/hooks/useTasks';
import { SectionHeader } from '../../components/ui/SectionHeader';
import type { SimplifiedEvent } from '../../gen/events_pb';
import { ChoresCard } from './ChoresCard';
import { DateCard } from './DateCard';
import { FridgeNote } from './FridgeNote';
import { Quote } from './Quote';
import { RhythmCard } from './RhythmCard';
import { SharedListPreview } from './SharedListPreview';
import type { TodayData } from './useTodayData';
import type { TodayView } from './todayView';

const styles = stylex.create({
  grid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.55fr) minmax(260px, 0.85fr)',
    gridTemplateAreas: '"main date" "main rest"',
    gap: 'clamp(16px, 2.2vh, 24px)',
    alignItems: 'start',
    '@media (max-width: 1040px)': {
      gridTemplateColumns: 'minmax(0, 1fr)',
      gridTemplateAreas: '"main" "date" "rest"',
    },
    '@media (max-width: 900px)': {
      gridTemplateAreas: '"date" "main" "rest"',
    },
  },
  main: {
    gridArea: 'main',
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(16px, 2.4vh, 26px)',
    minWidth: 0,
    // Stretch to the date rail's height so the quote can sit at the column's foot.
    alignSelf: 'stretch',
  },
  rail: {
    gridArea: 'rest',
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(12px, 1.7vh, 18px)',
    minWidth: 0,
  },
  gridSimple: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gridTemplateAreas: '"date rhythm chores" "quote quote quote"',
    gap: '20px',
    // The simple dashboard owns the viewport on desktop: the three columns
    // share one height, the quote gets its own full-width row, and the cards
    // scroll their own overflow so the page never does.
    '@media (min-width: 1101px)': {
      flexGrow: 1,
      flexBasis: 0,
      minHeight: 0,
      gridTemplateRows: 'minmax(0, 1fr) auto',
    },
    '@media (max-width: 1100px)': {
      gridTemplateColumns: 'minmax(0, 1fr)',
      gridTemplateAreas: '"date" "rhythm" "chores" "quote"',
    },
  },
  mainSimple: { display: 'contents' },
  simpleColumn: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    minHeight: 0,
  },
  simpleColumnCard: {
    // Only bites inside the height-bounded desktop grid: the card takes the
    // column's leftover height and scrolls its own content.
    minWidth: 0,
    '@media (min-width: 1101px)': {
      flexGrow: 1,
      flexBasis: 0,
      minHeight: 0,
      overflowX: 'hidden',
      overflowY: 'auto',
    },
  },
  rhythmArea: { gridArea: 'rhythm' },
  choresArea: { gridArea: 'chores' },
  railHidden: { display: 'none' },
  dateColumn: { gridArea: 'date', minWidth: 0 },
});

export function TodayLayout({
  data,
  view,
  onOpenEvent,
  onAddEvent,
  onEditTask,
  onAddTask,
  onOpenNote,
}: {
  data: TodayData;
  view: TodayView;
  onOpenEvent: (event: SimplifiedEvent) => void;
  onAddEvent: () => void;
  onEditTask: (task: TaskMessage) => void;
  onAddTask: () => void;
  onOpenNote: (note: NoteMessage) => void;
}) {
  return (
    <div {...stylex.props(view === 'simple' ? styles.gridSimple : styles.grid)}>
      <section {...stylex.props(styles.dateColumn, view === 'simple' && styles.simpleColumn)}>
        {view === 'simple' && <SectionHeader title="Today" />}
        <DateCard
          now={data.now}
          weather={data.weather.data}
          eventCount={data.eventCount}
          openTaskCount={data.openTasks.length}
          sx={styles.simpleColumnCard}
        />
      </section>

      <div {...stylex.props(styles.main, view === 'simple' && styles.mainSimple)}>
        <RhythmCard
          events={data.todayEvents}
          nextEvent={data.nextEvent}
          nextStart={data.nextStart}
          eventCount={data.eventCount}
          weekCount={data.weekCount}
          monthCount={data.monthCount}
          onOpenEvent={onOpenEvent}
          onAdd={onAddEvent}
          sectionSx={view === 'simple' ? [styles.rhythmArea, styles.simpleColumn] : undefined}
          cardSx={styles.simpleColumnCard}
        />

        <ChoresCard
          openTasks={data.openTasks}
          doneTasks={data.doneTasks}
          nameFor={data.nameFor}
          onEdit={onEditTask}
          onAdd={onAddTask}
          sectionSx={view === 'simple' ? [styles.choresArea, styles.simpleColumn] : undefined}
          cardSx={styles.simpleColumnCard}
        />

        {view === 'full' && <Quote quote={data.quote.data} simple={false} />}
      </div>

      <aside {...stylex.props(styles.rail, view === 'simple' && styles.railHidden)}>
        <FridgeNote
          note={data.latestNote}
          pending={data.notes.isPending}
          nameFor={data.nameFor}
          onOpen={onOpenNote}
        />
        <SharedListPreview list={data.topList} />
      </aside>

      {view === 'simple' && <Quote quote={data.quote.data} simple />}
    </div>
  );
}
