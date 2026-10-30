export const dayCodes = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'] as const;

export const weekdayNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export const weekdayShortNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

/** Monday-first order, matching the calendar. */
export const weekOrder = [1, 2, 3, 4, 5, 6, 0] as const;

export const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export const ALLOWED_KEYS = new Set([
  'FREQ',
  'INTERVAL',
  'BYDAY',
  'BYMONTHDAY',
  'BYMONTH',
  'COUNT',
  'UNTIL',
  'WKST',
]);

export const dayIndexByCode: Record<string, number> = Object.fromEntries(
  dayCodes.map((code, index) => [code, index]),
);
