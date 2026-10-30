# syntax=docker/dockerfile:1

# --- Build the SPA ---------------------------------------------------------
FROM node:24-bookworm-slim AS client
WORKDIR /src/HomeHub.Client
COPY HomeHub.Client/package.json HomeHub.Client/package-lock.json ./
RUN npm ci
COPY HomeHub.Client/ ./
RUN npm run build

# --- Publish the hub as one self-contained file ----------------------------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Restore first so the layer is cached across source changes.
COPY Directory.Packages.props ./
COPY HomeHub.Events/HomeHub.Events.csproj HomeHub.Events/
COPY HomeHub.Integrations/HomeHub.Integrations.csproj HomeHub.Integrations/
COPY HomeHub.Lists/HomeHub.Lists.csproj HomeHub.Lists/
COPY HomeHub.Notes/HomeHub.Notes.csproj HomeHub.Notes/
COPY HomeHub.Tasks/HomeHub.Tasks.csproj HomeHub.Tasks/
COPY HomeHub.Users/HomeHub.Users.csproj HomeHub.Users/
COPY HomeHub.Hub/HomeHub.Hub.csproj HomeHub.Hub/
RUN dotnet restore HomeHub.Hub/HomeHub.Hub.csproj -r linux-x64

COPY HomeHub.Events/ HomeHub.Events/
COPY HomeHub.Integrations/ HomeHub.Integrations/
COPY HomeHub.Lists/ HomeHub.Lists/
COPY HomeHub.Notes/ HomeHub.Notes/
COPY HomeHub.Tasks/ HomeHub.Tasks/
COPY HomeHub.Users/ HomeHub.Users/
COPY HomeHub.Hub/ HomeHub.Hub/
COPY --from=client /src/HomeHub.Client/dist/ /src/HomeHub.Hub/wwwroot/

# Invariant globalization keeps libicu out of the distroless runtime.
RUN dotnet publish HomeHub.Hub/HomeHub.Hub.csproj \
      -c Release \
      -r linux-x64 \
      --self-contained true \
      -p:PublishSingleFile=true \
      -p:IncludeAllContentForSelfExtract=true \
      -p:EnableCompressionInSingleFile=true \
      -p:InvariantGlobalization=true \
      -p:DebugType=None \
      -p:DebugSymbols=false \
      -o /out

# --- Runtime: distroless, no shell, non-root -------------------------------
FROM gcr.io/distroless/cc-debian12:nonroot
WORKDIR /app
COPY --chown=65532:65532 --from=build /out/HomeHub.Hub /app/HomeHub.Hub
# Pre-create the data directory as the runtime user so a named volume mounted
# at /data inherits the ownership.
COPY --chown=65532:65532 docker/data/.keep /data/.keep
# Persist the SQLite database across container upgrades. Without an explicit
# mount Docker creates an anonymous volume here; use `-v homehub-data:/data`
# for a named one.
VOLUME ["/data"]

ENV ASPNETCORE_ENVIRONMENT=Production \
    DOTNET_BUNDLE_EXTRACT_BASE_DIR=/tmp/dotnet \
    ConnectionStrings__DefaultConnection="Data Source=/data/homehub.db"

EXPOSE 5000 5001
USER nonroot:nonroot
ENTRYPOINT ["/app/HomeHub.Hub"]
