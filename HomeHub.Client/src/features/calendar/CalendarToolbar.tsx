import * as stylex from '@stylexjs/stylex';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { IconButton } from '../../components/ui/Button';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { colors, fonts, motion, radius } from '../../styles/tokens.stylex';
import { type CalendarView, viewNames, viewOptions } from './calendarOptions';

const styles = stylex.create({
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    paddingBlock: '14px',
    paddingInline: '16px',
    flexWrap: 'wrap',
  },
  monthLabel: {
    fontFamily: fonts.display,
    fontSize: '23px',
    fontWeight: 540,
    letterSpacing: '-0.025em',
    color: colors.ink,
    margin: 0,
  },
  toolbarGroup: { display: 'flex', alignItems: 'center', gap: '4px' },
  toolbarRight: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '8px',
    flexWrap: 'wrap',
  },
  todayButton: {
    borderWidth: 0,
    backgroundColor: 'transparent',
    borderRadius: radius.sm,
    paddingBlock: '5px',
    paddingInline: '9px',
    fontFamily: fonts.sans,
    fontSize: '12px',
    fontWeight: 600,
    color: colors.accentInk,
    transitionProperty: 'background-color',
    transitionDuration: motion.fast,
    ':hover': { backgroundColor: colors.accentWash },
  },
});

export function CalendarToolbar({
  label,
  view,
  onViewChange,
  onToday,
  onPrev,
  onNext,
}: {
  label: string;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onToday: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div {...stylex.props(styles.toolbar)}>
      <h2 {...stylex.props(styles.monthLabel)}>{label}</h2>
      <div {...stylex.props(styles.toolbarRight)}>
        <SegmentedControl<CalendarView>
          value={view}
          options={viewOptions}
          onChange={onViewChange}
        />
        <div {...stylex.props(styles.toolbarGroup)}>
          <button type="button" onClick={onToday} {...stylex.props(styles.todayButton)}>
            Today
          </button>
          <IconButton label={`Previous ${viewNames[view]}`} size="sm" onClick={onPrev}>
            <ChevronLeft size={17} />
          </IconButton>
          <IconButton label={`Next ${viewNames[view]}`} size="sm" onClick={onNext}>
            <ChevronRight size={17} />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
