import { atom } from 'nanostores';

const STORAGE_KEY = 'homehub.apiKey';

function readKey(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export const $apiKey = atom<string | null>(readKey());

export function setApiKey(key: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, key);
  } catch {
    // Storage can be unavailable in private modes; the in-memory key still works.
  }
  $apiKey.set(key);
}

export function clearApiKey() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore.
  }
  $apiKey.set(null);
}

export function maskApiKey(key: string): string {
  if (key.length <= 8) return '••••••••';
  return `${'•'.repeat(Math.min(18, key.length - 4))}${key.slice(-4)}`;
}
