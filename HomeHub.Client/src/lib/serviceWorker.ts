/**
 * Registers the installability service worker in production. It caches nothing,
 * so the hub remains the single source of truth. Non-secure origins cannot
 * register one, and the browser-installed app requires HTTPS.
 */
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error: unknown) => {
      console.warn('Service worker registration failed', error);
    });
  });
}
