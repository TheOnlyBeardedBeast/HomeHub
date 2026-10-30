import { atom } from 'nanostores';

export type ToastTone = 'info' | 'success' | 'error';

export interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

export const $toasts = atom<ToastItem[]>([]);

let nextId = 1;

export function dismissToast(id: number) {
  $toasts.set($toasts.get().filter((toast) => toast.id !== id));
}

export function toast(message: string, tone: ToastTone = 'info') {
  const id = nextId++;
  $toasts.set([...$toasts.get(), { id, message, tone }]);
  window.setTimeout(() => dismissToast(id), 4200);
}
