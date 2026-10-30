import * as stylex from '@stylexjs/stylex';
import { type RecurrenceDraft, weekOrder, weekdayNames } from '../../../lib/rrules';
import { monthDayOptions, ordinalOptions } from './recurrenceEditorUtils';
import { recurrenceStyles as styles } from './recurrenceStyles';

export function MonthlyPattern({
  value,
  onChange,
}: {
  value: RecurrenceDraft;
  onChange: (value: RecurrenceDraft) => void;
}) {
  return (
    <>
      <div {...stylex.props(styles.line)}>
        <span>On</span>
        <div {...stylex.props(styles.modes)} role="group" aria-label="Monthly pattern">
          <button
            type="button"
            aria-pressed={value.monthlyPattern === 'day'}
            onClick={() => onChange({ ...value, monthlyPattern: 'day' })}
            {...stylex.props(styles.mode, value.monthlyPattern === 'day' && styles.modeOn)}
          >
            Day of month
          </button>
          <button
            type="button"
            aria-pressed={value.monthlyPattern === 'weekday'}
            onClick={() => onChange({ ...value, monthlyPattern: 'weekday' })}
            {...stylex.props(styles.mode, value.monthlyPattern === 'weekday' && styles.modeOn)}
          >
            Weekday
          </button>
        </div>
      </div>
      {value.monthlyPattern === 'day' ? (
        <div {...stylex.props(styles.line)}>
          <span>Day</span>
          <select
            aria-label="Day of the month"
            value={String(value.monthDay)}
            onChange={(event) => onChange({ ...value, monthDay: Number(event.target.value) })}
            {...stylex.props(styles.select)}
          >
            {monthDayOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div {...stylex.props(styles.line)}>
          <select
            aria-label="Weekday position"
            value={String(value.monthOrdinal)}
            onChange={(event) => onChange({ ...value, monthOrdinal: Number(event.target.value) })}
            {...stylex.props(styles.select)}
          >
            {ordinalOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            aria-label="Weekday"
            value={String(value.monthWeekday)}
            onChange={(event) => onChange({ ...value, monthWeekday: Number(event.target.value) })}
            {...stylex.props(styles.select)}
          >
            {weekOrder.map((day) => (
              <option key={day} value={day}>
                {weekdayNames[day]}
              </option>
            ))}
          </select>
        </div>
      )}
    </>
  );
}
