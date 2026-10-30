import * as stylex from '@stylexjs/stylex';
import type { RecurrenceDraft } from '../../../lib/rrules';
import { recurrenceStyles as styles } from './recurrenceStyles';
import { unitLabel } from './recurrenceEditorUtils';

export function RecurrenceInterval({
  value,
  onChange,
}: {
  value: RecurrenceDraft;
  onChange: (value: RecurrenceDraft) => void;
}) {
  return (
    <div {...stylex.props(styles.line)}>
      <span>Every</span>
      <input
        type="number"
        min={1}
        max={999}
        aria-label="Repeat interval"
        value={value.interval}
        onChange={(event) =>
          onChange({
            ...value,
            interval: Math.max(1, Math.floor(Number(event.target.value)) || 1),
          })
        }
        {...stylex.props(styles.number)}
      />
      <span>{unitLabel(value.frequency, value.interval)}</span>
    </div>
  );
}
