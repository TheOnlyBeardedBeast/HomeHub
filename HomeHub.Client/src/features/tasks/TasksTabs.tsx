import * as stylex from '@stylexjs/stylex';
import { CheckCircle2, Circle, Repeat2 } from 'lucide-react';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { colors, fonts } from '../../styles/tokens.stylex';

export type TaskTab = 'open' | 'done' | 'repeating';

const styles = stylex.create({
  controls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '14px',
    flexWrap: 'wrap',
    marginBottom: '16px',
  },
  summary: {
    fontFamily: fonts.sans,
    fontSize: '12.5px',
    color: colors.inkMuted,
  },
});

export function TasksTabs({
  tab,
  openCount,
  doneCount,
  repeatingCount,
  onTabChange,
}: {
  tab: TaskTab;
  openCount: number;
  doneCount: number;
  repeatingCount: number;
  onTabChange: (tab: TaskTab) => void;
}) {
  return (
    <div {...stylex.props(styles.controls)}>
      <SegmentedControl<TaskTab>
        value={tab}
        onChange={onTabChange}
        options={[
          {
            value: 'open',
            label: `Open · ${openCount}`,
            icon: <Circle size={13} />,
          },
          {
            value: 'done',
            label: `Done · ${doneCount}`,
            icon: <CheckCircle2 size={13} />,
          },
          {
            value: 'repeating',
            label: `Repeating · ${repeatingCount}`,
            icon: <Repeat2 size={13} />,
          },
        ]}
      />
      <span {...stylex.props(styles.summary)}>
        {tab === 'open' && `${openCount} waiting`}
        {tab === 'done' && `${doneCount} finished`}
        {tab === 'repeating' && `${repeatingCount} recurring chores`}
      </span>
    </div>
  );
}
