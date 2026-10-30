import * as stylex from '@stylexjs/stylex';
import { toDateInput } from '../../../lib/format';
import {
  type RecurrenceDraft,
  type RecurrenceEnd as RecurrenceEndValue,
} from '../../../lib/rrules';
import { recurrenceStyles as styles } from './recurrenceStyles';

export function RecurrenceEnd({
  value,
  onChange,
  anchor,
}: {
  value: RecurrenceDraft;
  onChange: (value: RecurrenceDraft) => void;
  anchor: Date;
}) {
  function setEnd(end: RecurrenceEndValue) {
    if (end === 'until' && !value.until) {
      const date = new Date(anchor);
      date.setFullYear(date.getFullYear() + 1);
      onChange({ ...value, end, until: toDateInput(date) });
      return;
    }
    if (end === 'count' && value.count < 1) {
      onChange({ ...value, end, count: 10 });
      return;
    }
    onChange({ ...value, end });
  }

  return (
    <>
      <div {...stylex.props(styles.line)}>
        <span>Ends</span>
        <div {...stylex.props(styles.modes)} role="group" aria-label="Repeat end">
          <button
            type="button"
            aria-pressed={value.end === 'never'}
            onClick={() => setEnd('never')}
            {...stylex.props(styles.mode, value.end === 'never' && styles.modeOn)}
          >
            Never
          </button>
          <button
            type="button"
            aria-pressed={value.end === 'until'}
            onClick={() => setEnd('until')}
            {...stylex.props(styles.mode, value.end === 'until' && styles.modeOn)}
          >
            On date
          </button>
          <button
            type="button"
            aria-pressed={value.end === 'count'}
            onClick={() => setEnd('count')}
            {...stylex.props(styles.mode, value.end === 'count' && styles.modeOn)}
          >
            After
          </button>
        </div>
      </div>

      {value.end === 'until' && (
        <div {...stylex.props(styles.line)}>
          <input
            type="date"
            aria-label="Repeat end date"
            value={value.until}
            onChange={(event) => onChange({ ...value, until: event.target.value })}
            {...stylex.props(styles.date)}
          />
          {!value.until && <span {...stylex.props(styles.error)}>Pick a date.</span>}
        </div>
      )}

      {value.end === 'count' && (
        <div {...stylex.props(styles.line)}>
          <input
            type="number"
            min={1}
            max={999}
            aria-label="Number of repetitions"
            value={value.count}
            onChange={(event) =>
              onChange({
                ...value,
                count: Math.max(1, Math.floor(Number(event.target.value)) || 1),
              })
            }
            {...stylex.props(styles.number)}
          />
          <span>times</span>
          {value.count < 1 && <span {...stylex.props(styles.error)}>At least once.</span>}
        </div>
      )}
    </>
  );
}
