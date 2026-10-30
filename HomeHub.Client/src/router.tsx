import {
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
} from '@tanstack/react-router';
import { RootLayout } from './components/RootLayout';
import { NotFoundPage } from './pages/NotFoundPage';
import { RouteErrorPage } from './pages/RouteErrorPage';

const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
  errorComponent: RouteErrorPage,
});

const todayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: lazyRouteComponent(() => import('./pages/TodayPage'), 'TodayPage'),
});

const calendarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/calendar',
  component: lazyRouteComponent(() => import('./pages/CalendarPage'), 'CalendarPage'),
});

const tasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tasks',
  component: lazyRouteComponent(() => import('./pages/TasksPage'), 'TasksPage'),
});

const notesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notes',
  component: lazyRouteComponent(() => import('./pages/NotesPage'), 'NotesPage'),
});

const listsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/lists',
  component: lazyRouteComponent(() => import('./pages/ListsPage'), 'ListsPage'),
});

const householdRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/household',
  component: lazyRouteComponent(() => import('./pages/HouseholdPage'), 'HouseholdPage'),
});

const routeTree = rootRoute.addChildren([
  todayRoute,
  calendarRoute,
  tasksRoute,
  notesRoute,
  listsRoute,
  householdRoute,
]);

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
