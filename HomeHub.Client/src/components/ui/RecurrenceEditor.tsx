import * as stylex from '@stylexjs/stylex';
import { Repeat } from 'lucide-react';
import { useId } from 'react';
import {
  describeRRule,
  recurrenceError,
  recurrenceToRRule,
  type RecurrenceDraft,
  type RecurrenceFrequency,
} from '../../lib/rrules';
import { MonthlyPattern } from './recurrence/MonthlyPattern';
import { RecurrenceEnd } from './recurrence/RecurrenceEnd';
import { RecurrenceInterval } from './recurrence/RecurrenceInterval';
import {
  buildFrequencyOptions,
  changeFrequency,
  isPresetFrequency,
} from './recurrence/recurrenceEditorUtils';
import { recurrenceStyles as styles } from './recurrence/recurrenceStyles';
import { WeeklyDays } from './recurrence/WeeklyDays';
import { YearlyPattern } from './recurrence/YearlyPattern';

export function RecurrenceEditor({
  value,
  onChange,
  anchor,
  allowNone = true,
}: {
  value: RecurrenceDraft;
  onChange: (value: RecurrenceDraft) => void;
  anchor: Date;
  allowNone?: boolean;
}) {
  const titleId = useId();
  const rule = recurrenceToRRule(value, anchor);
  const summary = isPresetFrequency(value.frequency) ? describeRRule(rule) : '';
  const problem = recurrenceError(value);

  const frequencyOptions = buildFrequencyOptions(allowNone);

  function setFrequency(frequency: RecurrenceFrequency) {
    const next = changeFrequency(value, frequency, anchor);
    if (next) onChange(next);
  }

  return (
    <div {...stylex.props(styles.panel)} role="group" aria-labelledby={titleId}>
      <div {...stylex.props(styles.heading)}>
        <span id={titleId} {...stylex.props(styles.label)}>
          <Repeat size={13} /> Repeats
        </span>
        <select
          aria-label="Repeat frequency"
          value={value.frequency}
          onChange={(event) => setFrequency(event.target.value as RecurrenceFrequency)}
          {...stylex.props(styles.select)}
        >
          {frequencyOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {isPresetFrequency(value.frequency) && (
        <>
          <RecurrenceInterval value={value} onChange={onChange} />

          {value.frequency === 'weekly' && <WeeklyDays value={value} onChange={onChange} />}

          {value.frequency === 'monthly' && <MonthlyPattern value={value} onChange={onChange} />}

          {value.frequency === 'yearly' && <YearlyPattern value={value} onChange={onChange} />}

          <RecurrenceEnd value={value} onChange={onChange} anchor={anchor} />

          {summary && (
            <p {...stylex.props(styles.summary)} aria-live="polite">
              <Repeat size={12} {...stylex.props(styles.summaryIcon)} />
              {summary}
            </p>
          )}
        </>
      )}

      {value.frequency === 'custom' && (
        <>
          <textarea
            aria-label="Custom RRULE"
            value={value.custom}
            placeholder="FREQ=WEEKLY;BYDAY=MO,TH"
            spellCheck={false}
            onChange={(event) => onChange({ ...value, custom: event.target.value })}
            {...stylex.props(styles.custom)}
          />
          <p {...stylex.props(styles.hint)}>
            Advanced: saved as an RFC 5545 RRULE. Use the frequency menu above to return to the
            controls.
          </p>
          {problem && <p {...stylex.props(styles.error)}>{problem}</p>}
        </>
      )}
    </div>
  );
}
