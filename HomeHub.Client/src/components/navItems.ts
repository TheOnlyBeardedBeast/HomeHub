import { CalendarDays, CircleCheckBig, House, ListChecks, NotebookPen } from 'lucide-react';

export const navItems = [
  { to: '/', label: 'Today', icon: House },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/tasks', label: 'Tasks', icon: CircleCheckBig },
  { to: '/notes', label: 'Notes', icon: NotebookPen },
  { to: '/lists', label: 'Lists', icon: ListChecks },
] as const;

export function isNavActive(to: string, pathname: string): boolean {
  return to === '/' ? pathname === '/' : pathname.startsWith(to);
}
