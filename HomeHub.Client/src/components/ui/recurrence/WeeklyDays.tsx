import * as stylex from '@stylexjs/stylex';
import {
  type RecurrenceDraft,
  weekOrder,
  weekdayNames,
  weekdayShortNames,
} from '../../../lib/rrules';
import { recurrenceStyles as styles } from './recurrenceStyles';

export function WeeklyDays({
  value,
  onChange,
}: {
  value: RecurrenceDraft;
  onChange: (value: RecurrenceDraft) => void;
}) {
  function toggleDay(day: number) {
    const selected = value.weekdays.includes(day);
    const weekdays = selected
      ? value.weekdays.filter((item) => item !== day)
      : [...value.weekdays, day];
    if (weekdays.length === 0) return;
    onChange({ ...value, weekdays });
  }

  return (
    <div {...stylex.props(styles.line)}>
      <span>On</span>
      <div {...stylex.props(styles.days)} role="group" aria-label="Days of the week">
        {weekOrder.map((day) => {
          const selected = value.weekdays.includes(day);
          return (
            <button
              key={day}
              type="button"
              aria-label={weekdayNames[day]}
              aria-pressed={selected}
              onClick={() => toggleDay(day)}
              {...stylex.props(styles.day, selected && styles.dayOn)}
            >
              {weekdayShortNames[day]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
