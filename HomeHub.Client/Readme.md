# HomeHub Client

The web client for HomeHub: a responsive household dashboard for today's agenda,
the shared calendar, chores, notes, lists, and household members.

Built with Vite, React 19, and TypeScript. Server state lives in
[TanStack Query](https://tanstack.com/query), routing in
[TanStack Router](https://tanstack.com/router), forms in
[TanStack Form](https://tanstack.com/form), and small UI state (API key,
toasts) in [nanostores](https://nanostores.github.io/nanostores/). Styling uses
[StyleX](https://stylexjs.com/) with a warm, paper-and-clay design language.

## Prerequisites

- Node.js 20 or newer
- The HomeHub hub running on `http://localhost:5000`
- An API key. Use the admin key from `Authentication__AdminApiKey`, or ask an
  admin to create a member key under **Household → Members & keys**.

## Run it

```bash
npm install
npm run gen     # regenerate Connect/gRPC-Web clients from the .proto files (only after proto changes)
npm run dev     # http://localhost:5173
```

The dev server proxies `/HomeHub.*` and `/api` to `http://localhost:5000`. Point
it elsewhere with `HOMEHUB_API`:

```bash
HOMEHUB_API=http://192.168.1.20:5000 npm run dev
```

## Production

The Hub serves this SPA itself. From the repository root:

```bash
task publish       # build the client, copy it into HomeHub.Hub/wwwroot, single-file publish
task publish RID=win-x64
```

The release is one self-contained executable under `artifacts/<rid>/`; the
client and `appsettings.json` are embedded, and the SQLite database lives in the
OS app-data folder (see `HomeHub.Hub/Readme.md`).

To build only the client:

```bash
npm run build      # type-check and emit static assets to dist/
npm run preview    # serve dist/ locally
```

The built app expects the hub at the same origin. To use a different base URL,
set `VITE_API_BASE_URL` at build time:

```bash
VITE_API_BASE_URL=https://homehub.example.lan npm run build
```

If hosting `dist/` separately, put it behind a reverse proxy that forwards
`/HomeHub.*` and `/api` to the hub — the same paths the dev proxy uses.

## Signing in

HomeHub authenticates every request with an `x-api-key` header. The client asks
for a key on first load and keeps it in `localStorage`; sign out from the
**Household** page to clear it.

- **Admin key** — the single key configured in `Authentication:AdminApiKey`
  (env: `Authentication__AdminApiKey`). Admins can create member keys.
- **Member keys** — created on the Household page. The key is shown once, then
  only its SHA-256 hash is stored.

## Layout

```
src/
  api/          Connect clients, query hooks, error formatting
  components/   App shell, dialogs, form controls, StyleX primitives
  features/     Domain dialogs and rows (calendar, tasks, notes, lists, household)
  gen/          Generated protobuf-es messages and Connect service descriptors
  lib/          Query client, session/toast stores, date and RRULE helpers
  pages/        Route-level screens
  styles/       Design tokens and global CSS
```

All server communication goes through generated Connect clients in
`src/api/`; components never touch protobuf messages directly — hooks map them
to small view types first.
