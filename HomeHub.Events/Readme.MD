# HomeHub.Events

## Description

This is an event store for a calendar application, providing gRPC-based services for managing calendar events with support for recurring events and exceptions.

## Event Entity

An event has the following properties:

- `title` (string)
- `description` (string, optional)
- `organizer` (GUID)
- `start` (DateTime, optional)
- `end` (DateTime, optional)
- `rrules` (JSONB string array, optional) - Recurrence rules
- `category` (string)
- `allDay` (boolean, default false)
- `exceptDates` (JSONB DateTime string array, optional) - Exception dates for recurring events

## Database

Uses PostgreSQL with the `rrule` extension for handling recurring event rules.

## Transfer Protocol

Uses gRPC and gRPC-Web for communication. Kestrel is configured to support both HTTP/1 and HTTP/2.

## gRPC Endpoints

- `events(dateRange)`: Retrieves a simplified list of events within the specified date range for display in a custom calendar view.
- `event(guid)`: Fetches the full details of a specific event for editing purposes.
- `removeEvent(guid)`: Permanently removes an event from the store.
- `removeOccurrence(guid, datetime)`: Adds the specified datetime to the event's `exceptDates`, effectively excluding that occurrence from a recurring series (similar to ExceptionDates in ical.net).
- `updateEvent(event)`: Updates an existing event with new data (the event object must include an ID).
- `createEvent(event)`: Creates a new event in the store (the event object should not include an ID).

## Services

### EventService

The `EventService` handles all event management operations, including CRUD operations and recurrence handling.

#### Event Retrieval Process

The `EventService` loads events from the database according to the specified date range, maps them to ical.net `CalendarEvent` objects, generates occurrences from recurrence rules (while respecting exception dates), and then maps the results to a simplified DTO for efficient transmission over gRPC.

## Architecture

- **Protos**: Contains Protocol Buffer definitions (`.proto` files) for gRPC services.
- **Services**: Implements the business logic for gRPC endpoints.
- **Database Layer**: Uses Entity Framework Core (assumed) with PostgreSQL for data persistence.
- **Recurrence Handling**: Leverages the `Ical.Net` library for parsing and generating recurring events.

## Dependencies

Key NuGet packages (based on typical gRPC and calendar projects):

- `Grpc.AspNetCore` - For gRPC services
- `Grpc.Tools` - For generating code from .proto files
- `Ical.Net` - For handling iCalendar recurrence rules
- `Npgsql.EntityFrameworkCore.PostgreSQL` - For PostgreSQL database access
- `Microsoft.EntityFrameworkCore` - For ORM functionality

## Setup and Running

### Prerequisites

- .NET 9.0 SDK
- PostgreSQL database with the `rrule` extension installed

### Installation

1. Clone the repository.
2. Restore NuGet packages: `dotnet restore`
3. Configure the database connection string in `appsettings.json` or `appsettings.Development.json`.
4. Ensure the PostgreSQL database is set up and accessible.

### Running the Application

```bash
dotnet run
```

The service will start and listen for gRPC requests as configured in `launchSettings.json`.

### Development

- Protobuf files are located in the `Protos/` directory.
- Generated gRPC code is in `obj/Debug/net9.0/Protos/`.
- Services are implemented in the `Services/` directory.
