export type TodayView = 'simple' | 'full';

const VIEW_KEY = 'homehub.todayView';

export function readTodayView(): TodayView {
  try {
    return window.localStorage.getItem(VIEW_KEY) === 'simple' ? 'simple' : 'full';
  } catch {
    return 'full';
  }
}

export function saveTodayView(view: TodayView) {
  try {
    window.localStorage.setItem(VIEW_KEY, view);
  } catch {
    // Storage can be blocked; the switch still works for this session.
  }
}
