# HomeHub.Hub

Single host for all HomeHub services. References the domain projects (`HomeHub.Users`, `HomeHub.Events`, `HomeHub.Tasks`, `HomeHub.Notes`, `HomeHub.Lists`) and the external integrations (`HomeHub.Integrations`), exposing them on two plaintext listeners:

- `http://0.0.0.0:5000` - HTTP/1.1: the web client, gRPC-Web, and the ICS export
- `http://0.0.0.0:5001` - HTTP/2: gRPC (h2c), gRPC-Web

Two ports are required because plaintext Kestrel cannot serve HTTP/1.1 and HTTP/2 on the same port without TLS/ALPN. Put a TLS-terminating reverse proxy in front if a single public port is needed.

## Authentication

Hub API calls must send an `x-api-key` header: paths under `/HomeHub.` (gRPC), `/api/`, and `/grpc.` (reflection). The web client — `index.html`, assets, and client-side routes — is public; the browser cannot attach a key before the app loads. The key is matched against the admin key from `Authentication:AdminApiKey` (default empty; set `Authentication__AdminApiKey` in the environment) or hashed and looked up in the `Users` table.

User keys are created through `UserService.CreateUser` using the admin key; the response contains the only plaintext copy of the key. User-management calls (`CreateUser`, `DeleteUser`) require the admin key, while domain calls that create data require a user key so `CreatedBy` can be stamped.

## Web client

The SPA in `HomeHub.Client` is built and served from `wwwroot`, with `index.html` as the fallback for client-side routes. The root `Taskfile.yml` runs the whole flow:

```bash
task publish            # npm ci + build, copy dist to wwwroot, single-file publish
task publish RID=win-x64
task run                # run from source; serves whatever is currently in wwwroot
```

`task publish` writes one self-contained executable to `artifacts/<rid>/`. The SPA and `appsettings.json` are embedded in the bundle and extracted next to the running assembly at startup, so the executable can be copied anywhere as a single file. Configure the deployment with environment variables (`Authentication__AdminApiKey`, `Weather__ApiKey`, `Weather__Location`, `ConnectionStrings__DefaultConnection`).

`task publish:compressed` produces the same single file with a compressed bundle: about 54 MB instead of 112 MB, at the cost of a slightly slower first start. Native AOT is not an option for the hub — EF Core builds its model and queries at runtime, so an AOT build aborts on startup; trimming is unsupported for the same reason.

A distroless `Dockerfile` ships at the repository root: `docker build -t homehub .`. The image runs as non-root on `gcr.io/distroless/cc-debian12`, uses invariant globalization (no libicu), and keeps the database on a `/data` volume.

## What it hosts

- `HomeHub.Users` - `UserService`
- `HomeHub.Events` - `EventService`
- `HomeHub.Tasks` - `TaskService`
- `HomeHub.Notes` - `NoteService`
- `HomeHub.Lists` - `ListService`
- `HomeHub.Integrations` - `WeatherService`, `QuoteService` (upstream lookups, cached in memory)
- gRPC-Web and gRPC reflection
- `GET /api/events/ics` - ICS calendar export

## Configuration

The committed `appsettings.json` is the publishable default and contains no secrets. Local development uses `appsettings.Development.json`, which is gitignored and loaded only in Development (`Properties/launchSettings.json` sets `ASPNETCORE_ENVIRONMENT` for `dotnet run`):

```bash
cp HomeHub.Hub/appsettings.Development.example.json HomeHub.Hub/appsettings.Development.json
```

Every setting can be overridden at run time with environment variables (`__` replaces `:`):

- `Authentication__AdminApiKey` - admin key; empty disables user management and prints a startup warning
- `Weather__ApiKey` - WeatherAPI key; the weather block is hidden while it is empty
- `Weather__Location` - city name, postcode, or `auto:ip` (default)
- `ConnectionStrings__DefaultConnection` - SQLite connection string

The weather card uses [weatherapi.com](https://www.weatherapi.com/): register for a free key, copy it from the dashboard, and set `Weather__ApiKey`. Upstream responses are cached for an hour, so the free tier is ample.

## Data

A single `HubDbContext` (SQLite) implements `IEventDbContext`, `ITaskDbContext`, `INoteDbContext`, `IListDbContext`, and `IUserDbContext`, so every domain shares one `homehub.db` file. Migrations are applied on startup.

The database is the only file that lives outside the application, in the OS app-data folder:

- Windows: `%LOCALAPPDATA%\HomeHub\homehub.db`
- macOS: `~/Library/Application Support/HomeHub/homehub.db`
- Linux: `$XDG_DATA_HOME/HomeHub/homehub.db` (usually `~/.local/share/HomeHub/homehub.db`)

Override it with `ConnectionStrings:DefaultConnection`, e.g. `ConnectionStrings__DefaultConnection="Data Source=/srv/homehub/homehub.db"`.

```bash
dotnet run --project HomeHub.Hub

# Add a migration after changing HubDbContext
dotnet ef migrations add <Name> --project HomeHub.Hub --startup-project HomeHub.Hub
```

## Why the interfaces

The domain services live in their own projects and only depend on context interfaces; the Hub supplies the concrete context. That keeps the domain projects independent of the host while avoiding one `DbContext` per service.
