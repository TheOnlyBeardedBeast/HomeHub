import * as stylex from '@stylexjs/stylex';
import { atom } from 'nanostores';
import { darkShadow, darkTheme } from '../styles/tokens.stylex';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'homehub.theme';
const DARK_CLASSES = (stylex.props(darkTheme, darkShadow).className ?? '')
  .split(' ')
  .filter(Boolean);

function prefersDark() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches === true;
}

function initialTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // Storage can be unavailable in private modes.
  }
  return prefersDark() ? 'dark' : 'light';
}

export const $theme = atom<Theme>(initialTheme());

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.classList.remove(...DARK_CLASSES);
  if (theme === 'dark') root.classList.add(...DARK_CLASSES);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#000000' : '#f5f3ec');
}

$theme.listen(applyTheme);
applyTheme($theme.get());

export function toggleTheme() {
  const next: Theme = $theme.get() === 'dark' ? 'light' : 'dark';
  $theme.set(next);
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Keep the in-memory theme.
  }
}
