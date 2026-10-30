# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
dotnet build HomeHub.sln                # build everything
dotnet test HomeHub.sln                 # run all tests
dotnet test HomeHub.Tasks.Tests/HomeHub.Tasks.Tests.csproj --filter "FullyQualifiedName~GetTasksInRange"

dotnet run --project HomeHub.Hub        # run the whole application (the only executable)

# Taskfile (go-task) at the repository root
task publish                            # build the SPA into Hub/wwwroot, then single-file publish to artifacts/<rid>
task publish:compressed                 # same, compressed bundle (~54 MB instead of ~112 MB)
task publish RID=win-x64                # cross-publish for another OS
task run                                # run the hub from source

# Docker (distroless cc-debian12, non-root, DB on a /data volume)
docker build -t homehub .
docker run -d -p 5000:5000 -p 5001:5001 -v homehub-data:/data \
  -e Authentication__AdminApiKey=... homehub

# EF Core migrations (single HubDbContext)
dotnet ef migrations add <Name> --project HomeHub.Hub --startup-project HomeHub.Hub --output-dir Migrations
dotnet ef database update --project HomeHub.Hub --startup-project HomeHub.Hub
```

Environment note: all projects target `net10.0`; use the .NET 10 SDK and the 10.x `dotnet-ef` global tool. Secrets stay out of the repository: `HomeHub.Hub/appsettings.Development.json` is gitignored and loaded only in Development (`Properties/launchSettings.json` sets the environment for `dotnet run`), while the committed `appsettings.json` is secret-free and is what releases bundle. Runtime overrides use environment variables with `__` for `:`, notably `Authentication__AdminApiKey`, `Weather__ApiKey` (free key from weatherapi.com), `Weather__Location`, and `ConnectionStrings__DefaultConnection`.

Client (`HomeHub.Client/`):

```bash
cd HomeHub.Client
npm install
npm run gen        # regenerate Connect clients from the domain .proto files
npm run dev        # http://localhost:5173, proxying /HomeHub.* and /api to :5000
npm run build      # tsc -b && vite build
npm run preview    # serve dist/ at :4173 with the same /HomeHub.* and /api proxy
npm run typecheck
npm run lint       # ESLint flat config: size/complexity budgets and hooks rules
npm run format     # Prettier (also available as format:check)
```

`HOMEHUB_API` overrides the dev proxy target; `VITE_API_BASE_URL` sets the production API origin (defaults to same origin). See `HomeHub.Client/Readme.md` for sign-in and deployment details.

## Architecture

`HomeHub.Hub` is the single entry point. It references the domain projects — `HomeHub.Users`, `HomeHub.Events`, `HomeHub.Tasks`, `HomeHub.Notes`, `HomeHub.Lists`, and `HomeHub.Integrations` — which are class libraries (entities, gRPC service implementations, mappers, utils, protos). `HomeHub.Integrations` holds the weather and quote gRPC services: upstream lookups with in-memory caching and no database. `Program.cs` is only a composition root; Kestrel listeners, service registration, and the startup/pipeline/endpoints live in `HomeHub.Hub/Hosting`.

- **Authentication**: hub API requests (paths under `/HomeHub.`, `/api/`, and `/grpc.`) need an `x-api-key` header; the SPA files and client-side routes are public. `HomeHub.Hub/Authentication/ApiKeyAuthenticationMiddleware.cs` either matches the configured admin key (`Authentication:AdminApiKey`, settable via `Authentication__AdminApiKey`) or SHA-256-hashes the provided key and looks it up in `Users.HashedApiKey`, then populates the scoped `HomeHub.Users.Security.CurrentUser`. Services call `RequireUserId()` (user key) or `RequireAdmin()` (admin key; currently user creation/deletion). User API keys are six-word mnemonics from the embedded BIP39 list (`HomeHub.Users/Security/wordlist.txt`), returned only by `UserService.CreateUser` — only the hash is stored. `Users.Type` (`EndUser`/`Display`) marks a key as a person's device or a shared household screen.
- **Web client hosting**: the Hub serves the built SPA from `HomeHub.Hub/wwwroot` (generated, gitignored) with `index.html` as the fallback for client routes. `task publish` runs `npm ci && npm run build`, copies `HomeHub.Client/dist` into `wwwroot`, and publishes one self-contained executable per RID. The SPA and `appsettings.json` are bundled via `IncludeAllContentForSelfExtract` and extracted next to the running assembly at startup; `StaticWebAssetsEnabled` is off so the bundler can carry `wwwroot`. A dev server is still the normal way to work on the client (`npm run dev`).
- **One database, one context**: `HomeHub.Hub/Contexts/HubDbContext.cs` is a SQLite `DbContext` holding all entity sets. It implements `IEventDbContext`, `ITaskDbContext`, `INoteDbContext`, `IListDbContext`, and `IUserDbContext` (defined in each domain project); those interfaces are what the gRPC service constructors depend on. `Program.cs` registers `HubDbContext` once and forwards it to all five interfaces. The database is the only file outside the binary: `HomeHub.Hub/Hosting/AppDataPaths.cs` puts it under the OS app-data folder (`%LOCALAPPDATA%\HomeHub`, `~/Library/Application Support/HomeHub`, or `$XDG_DATA_HOME/HomeHub`), overridable with `ConnectionStrings:DefaultConnection`. Ownership fields (`CreatedBy`, `Organizer`, `AssignedTo`) are `Guid` user IDs; proto fields carry them as GUID strings. SQLite loses `DateTimeKind`, so `HubDbContext` applies a global UTC value converter to `DateTime`/`DateTime?` properties — keep relying on it rather than sprinkling `SpecifyKind` in mappers.
- **Migrations** live in `HomeHub.Hub/Migrations` and are applied automatically on startup (`Database.Migrate()`). The schema is owned solely by `HubDbContext` — entity configuration lives there, not in the domain projects.
- **Networking**: plaintext Kestrel cannot serve HTTP/1.1 and HTTP/2 on one port without TLS/ALPN. The host listens on `http://0.0.0.0:5000` (HTTP/1.1: the web client, gRPC-Web, and the ICS export) and `http://0.0.0.0:5001` (HTTP/2: gRPC, gRPC-Web). gRPC reflection is enabled, so `grpcurl -plaintext -H 'x-api-key: ...' localhost:5001 list` works once a key is configured. CORS is open so browser-based display clients can call the hub.
- **Events** is the most complete domain: recurrence is expanded in memory with Ical.Net from `Rrules`/`ExceptDates` primitive collections (stored as JSON TEXT by SQLite). The ICS export lives in `HomeHub.Events/Endpoints/EventsEndpoints.cs` and depends on `IEventDbContext`, so the domain project stays independent of the Hub. Its `.Rrules.Length` filters translate to SQLite `json_array_length`.
- **Tasks**: `RecurringTask` rows hold an RRULE; `GetTasksInRange` generates occurrences on the fly with `RecurrenceUtils` (Ical.Net) and suppresses generated occurrences already marked done for that occurrence date. Generated occurrences are not persisted; completing one creates a regular `Task` with `RecurringTaskId` and `CreatedAt` set to the occurrence date. `CreatedAt`/`CreatedBy` are server-owned on update.

**Client architecture:** `HomeHub.Client` is a Vite + React 19 SPA using TanStack Query (server state), TanStack Router (code-based routes in `src/router.tsx`, root route gates on the API key), TanStack Form, nanostores (API key in `localStorage`, toasts), and StyleX — no Tailwind. Generated Connect/gRPC-Web clients live in `src/gen` and are committed; rerun `npm run gen` after any proto change. Dialogs are native `<dialog>` elements; the app has a desktop sidebar and a mobile bottom nav. Design tokens are StyleX `defineVars` in `src/styles/tokens.stylex.ts`; keyframes live in `src/styles/global.css` as plain `@keyframes` because StyleX treats every export from a `.stylex` module as a `defineVars` group, so imported keyframes break the build. Notes and list items render GitHub-flavoured Markdown through `src/components/ui/Markdown.tsx` (react-markdown + remark-gfm, raw HTML disabled); its element styles are plain CSS under `.markdown` in `global.css`, since StyleX cannot target rendered descendants. Frontend refactoring rules — size budgets, one-hook/one-component-per-file placement, and the lint/format gate — live in `HomeHub.Client/REFACTORING.md`. Routes are lazy-loaded with `lazyRouteComponent` in `src/router.tsx`, and `vite.config.ts` pins React, TanStack Router, Connect/protobuf and Markdown into stable vendor chunks; keep new pages lazy and heavy shared dependencies in named groups so the initial payload stays small.

**Namespace gotcha:** Tasks data-layer types live under `HumeHub.Tasks` (typo in the namespace) — `HumeHub.Tasks.Entities`, `HumeHub.Tasks.Contexts`, `HumeHub.Tasks.Mappers`, `HumeHub.Tasks.Utils` — while its gRPC service is `HomeHub.Tasks.Services`. Follow the existing namespace for the folder you add files to.

**Package management:** central package management is on (`Directory.Packages.props` with `ManagePackageVersionsCentrally`). Add or bump versions there; `PackageReference` entries in csproj files must not carry a `Version`.

**Protos:** all `.proto` files compile with `GrpcServices="Server"` only, so no client stubs are generated. The generated namespace is set by `option csharp_namespace` (e.g. `HomeHub.Tasks`); changing a proto requires a build.

**Tests:** xUnit + EF Core InMemory. `HomeHub.Events.Tests`, `HomeHub.Tasks.Tests`, `HomeHub.Lists.Tests`, and `HomeHub.Users.Tests` construct `HubDbContext` directly with an in-memory database (hence they reference `HomeHub.Hub`) and pass `null!` as `ServerCallContext`. Domain service tests build a `CurrentUser` with `UserId` set (and `IsAdmin` for admin paths) rather than going through the HTTP middleware. Notes has no test project. Because tests use the InMemory provider, run the Hub once against SQLite when changing queries that depend on provider translation.

Per-service READMEs predate the single-host architecture and are partly stale (PostgreSQL, separate ports, unbuilt features); trust `HomeHub.Hub`, `Program.cs`, and `appsettings.json` instead.
