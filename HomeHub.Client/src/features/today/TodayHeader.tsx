import * as stylex from '@stylexjs/stylex';
import { CalendarPlus, Columns3, LayoutGrid, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { formatLongDate } from '../../lib/format';
import { todayTitle } from './todayData';
import type { TodayView } from './todayView';

const styles = stylex.create({
  desktopActions: {
    display: 'contents',
    '@media (max-width: 900px)': { display: 'none' },
  },
});

export function TodayHeader({
  now,
  firstName,
  view,
  onViewChange,
  onNewEvent,
  onAddTask,
}: {
  now: Date;
  firstName?: string;
  view: TodayView;
  onViewChange: (view: TodayView) => void;
  onNewEvent: () => void;
  onAddTask: () => void;
}) {
  return (
    <PageHeader
      eyebrow={formatLongDate(now)}
      title={todayTitle(now, firstName)}
      description="Here is how the house is moving today — the comings and goings, and the small things waiting to be done."
      hideDescriptionOnPhone
      actions={
        <>
          <SegmentedControl<TodayView>
            value={view}
            onChange={onViewChange}
            options={[
              { value: 'simple', label: 'Simple', icon: <Columns3 size={13} /> },
              { value: 'full', label: 'Full', icon: <LayoutGrid size={13} /> },
            ]}
          />
          <span {...stylex.props(styles.desktopActions)}>
            <Button variant="secondary" icon={<CalendarPlus size={15} />} onClick={onNewEvent}>
              New event
            </Button>
            <Button icon={<Plus size={15} />} onClick={onAddTask}>
              Add task
            </Button>
          </span>
        </>
      }
    />
  );
}
