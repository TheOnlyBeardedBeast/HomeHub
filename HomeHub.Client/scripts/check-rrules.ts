import assert from 'node:assert/strict';
import {
  defaultRecurrence,
  describeRRule,
  recurrenceError,
  recurrenceFromRRule,
  recurrenceToRRule,
} from '../src/lib/rrules.ts';

// Wednesday 21 October 2026.
const anchor = new Date(2026, 9, 21);
const round = (rule: string) => recurrenceToRRule(recurrenceFromRRule(rule, anchor), anchor);

assert.equal(round('FREQ=DAILY'), 'FREQ=DAILY');
assert.equal(round('FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR'), 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR');
assert.equal(round('FREQ=WEEKLY;INTERVAL=2;BYDAY=SA'), 'FREQ=WEEKLY;INTERVAL=2;BYDAY=SA');
assert.equal(round('FREQ=WEEKLY'), 'FREQ=WEEKLY;BYDAY=WE');
assert.equal(round('FREQ=MONTHLY'), 'FREQ=MONTHLY;BYMONTHDAY=21');
assert.equal(round('FREQ=YEARLY'), 'FREQ=YEARLY;BYMONTH=10;BYMONTHDAY=21');
assert.equal(round('FREQ=MONTHLY;BYDAY=-1FR'), 'FREQ=MONTHLY;BYDAY=-1FR');
assert.equal(round('FREQ=MONTHLY;BYDAY=2TU'), 'FREQ=MONTHLY;BYDAY=2TU');
assert.equal(round('FREQ=YEARLY;BYMONTH=11;BYDAY=4TH'), 'FREQ=YEARLY;BYMONTH=11;BYDAY=4TH');
assert.equal(round('FREQ=MONTHLY;BYMONTHDAY=-1'), 'FREQ=MONTHLY;BYMONTHDAY=-1');
assert.equal(round('FREQ=DAILY;INTERVAL=3;COUNT=10'), 'FREQ=DAILY;INTERVAL=3;COUNT=10');

const custom = recurrenceFromRRule('FREQ=WEEKLY;BYDAY=MO;BYSETPOS=1', anchor);
assert.equal(custom.frequency, 'custom');
assert.equal(custom.custom, 'FREQ=WEEKLY;BYDAY=MO;BYSETPOS=1');

const until = {
  ...defaultRecurrence(anchor, 'weekly'),
  end: 'until' as const,
  until: '2026-12-31',
};
const untilRule = recurrenceToRRule(until, anchor);
assert.equal(recurrenceFromRRule(untilRule, anchor).until, '2026-12-31');
assert.equal(describeRRule('FREQ=MONTHLY;BYDAY=2TU'), 'Monthly on the second Tuesday');
assert.equal(
  describeRRule('FREQ=YEARLY;BYMONTH=11;BYDAY=4TH;COUNT=5'),
  'Yearly on the fourth Thursday of November, for 5 occurrences',
);
assert.equal(
  recurrenceError({ ...defaultRecurrence(anchor, 'weekly'), frequency: 'custom' }),
  'Enter an RRULE, such as FREQ=WEEKLY;BYDAY=MO.',
);

console.log('RRULE checks passed.');
