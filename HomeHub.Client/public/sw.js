// Installability needs a service worker with a fetch handler. This one never
// intercepts or caches: the hub stays the single source of truth, so a stale
// shell would be worse than a network error.
self.addEventListener('fetch', () => {});
