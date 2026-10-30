export const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export type CalendarView = 'month' | 'week' | '3days' | 'day';

export const viewOptions: { value: CalendarView; label: string }[] = [
  { value: 'month', label: 'Month' },
  { value: 'week', label: 'Week' },
  { value: '3days', label: '3 days' },
  { value: 'day', label: 'Day' },
];

export const viewDays: Record<CalendarView, number> = {
  month: 42,
  week: 7,
  '3days': 3,
  day: 1,
};

export const viewNames: Record<CalendarView, string> = {
  month: 'month',
  week: 'week',
  '3days': 'three days',
  day: 'day',
};
