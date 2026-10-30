export const keys = {
  currentUser: ['current-user'] as const,
  users: ['users'] as const,
  events: (start: string, end: string) => ['events', start, end] as const,
  event: (id: string) => ['event', id] as const,
  eventPrefix: ['event'] as const,
  eventsPrefix: ['events'] as const,
  tasksPrefix: ['tasks'] as const,
  recurringPrefix: ['recurring-tasks'] as const,
  notesPrefix: ['notes'] as const,
  listsPrefix: ['lists'] as const,
  weather: ['weather'] as const,
  quote: ['quote'] as const,
};
