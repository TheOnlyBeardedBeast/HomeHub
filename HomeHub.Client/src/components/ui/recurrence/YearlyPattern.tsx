import * as stylex from '@stylexjs/stylex';
import { monthNames, type RecurrenceDraft, weekOrder, weekdayNames } from '../../../lib/rrules';
import { daysInMonth, ordinalOptions, yearDayOptions } from './recurrenceEditorUtils';
import { recurrenceStyles as styles } from './recurrenceStyles';

export function YearlyPattern({
  value,
  onChange,
}: {
  value: RecurrenceDraft;
  onChange: (value: RecurrenceDraft) => void;
}) {
  function setYearMonth(month: number) {
    const yearDay = value.yearDay === -1 ? -1 : Math.min(value.yearDay, daysInMonth(month));
    onChange({ ...value, yearMonth: month, yearDay });
  }

  return (
    <>
      <div {...stylex.props(styles.line)}>
        <span>On</span>
        <div {...stylex.props(styles.modes)} role="group" aria-label="Yearly pattern">
          <button
            type="button"
            aria-pressed={value.yearlyPattern === 'date'}
            onClick={() => onChange({ ...value, yearlyPattern: 'date' })}
            {...stylex.props(styles.mode, value.yearlyPattern === 'date' && styles.modeOn)}
          >
            Date
          </button>
          <button
            type="button"
            aria-pressed={value.yearlyPattern === 'weekday'}
            onClick={() => onChange({ ...value, yearlyPattern: 'weekday' })}
            {...stylex.props(styles.mode, value.yearlyPattern === 'weekday' && styles.modeOn)}
          >
            Weekday
          </button>
        </div>
      </div>
      {value.yearlyPattern === 'date' ? (
        <div {...stylex.props(styles.line)}>
          <select
            aria-label="Month"
            value={String(value.yearMonth)}
            onChange={(event) => setYearMonth(Number(event.target.value))}
            {...stylex.props(styles.select)}
          >
            {monthNames.map((month, index) => (
              <option key={month} value={index}>
                {month}
              </option>
            ))}
          </select>
          <select
            aria-label="Day of the month"
            value={String(value.yearDay)}
            onChange={(event) => onChange({ ...value, yearDay: Number(event.target.value) })}
            {...stylex.props(styles.select)}
          >
            {yearDayOptions(value.yearMonth).map((option) => (
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
            value={String(value.yearOrdinal)}
            onChange={(event) => onChange({ ...value, yearOrdinal: Number(event.target.value) })}
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
            value={String(value.yearWeekday)}
            onChange={(event) => onChange({ ...value, yearWeekday: Number(event.target.value) })}
            {...stylex.props(styles.select)}
          >
            {weekOrder.map((day) => (
              <option key={day} value={day}>
                {weekdayNames[day]}
              </option>
            ))}
          </select>
          <span {...stylex.props(styles.soft)}>of</span>
          <select
            aria-label="Month"
            value={String(value.yearMonth)}
            onChange={(event) => setYearMonth(Number(event.target.value))}
            {...stylex.props(styles.select)}
          >
            {monthNames.map((month, index) => (
              <option key={month} value={index}>
                {month}
              </option>
            ))}
          </select>
        </div>
      )}
    </>
  );
}
