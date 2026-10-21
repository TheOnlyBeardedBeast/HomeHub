# HomeHub.Tasks

A gRPC-based task management microservice for family task coordination in the HomeHub ecosystem.

## Overview

HomeHub.Tasks is a self-hosted family task management system that enables family members to create, manage, and assign tasks to each other. The application supports shared family tasks with optional recurring patterns using RRules.

## Features

- **Task Management**: Create, read, update, and delete family tasks
- **Task Assignment**: Assign tasks to specific family members
- **Recurring Tasks**: Support for recurring tasks using iCalendar RRule format
- **Multiple Protocols**: gRPC and gRPC Web support for diverse client compatibility
- **Family-First Design**: Single-family self-hosted deployment model

## Tech Stack

- **Framework**: ASP.NET Core 9.0
- **Protocols**: gRPC 2.64.0, gRPC Web 2.64.0
- **Database**: PostgreSQL (Entity Framework Core 9.0.2)
- **Language**: C#
- **Build System**: .NET CLI

## Architecture

### Project Structure

```
HumeHub.Tasks/
├── Contexts/          # Entity Framework DbContext
├── Entities/          # Data models
├── Migrations/        # Database migrations
├── Protos/            # gRPC service definitions
├── Services/          # gRPC service implementations
├── Mappers/           # Entity to DTO mappers
└── Program.cs         # Application entry point
```

## Data Models

### Task Entity

```csharp
public class Task
{
    public Guid Id { get; set; }                    // Auto-generated unique identifier
    public string Title { get; set; }               // Required: Task title/name
    public string? Description { get; set; }        // Optional: Detailed task description
    public string CreatedBy { get; set; }           // Required: User ID who created the task
    public string? AssignedTo { get; set; }         // Optional: User ID the task is assigned to
    public string? RRule { get; set; }              // Optional: iCalendar RRULE for recurring tasks
    public bool Done { get; set; }                  // Default: false. Marks task as completed
    public DateTime? DoneAt { get; set; }           // Optional: Timestamp when task was marked as done
}
```

### Field Descriptions

| Field       | Type     | Required | Description                                                   |
| ----------- | -------- | -------- | ------------------------------------------------------------- |
| Id          | Guid     | Yes      | Uniquely identifies a task                                    |
| Title       | string   | Yes      | Short descriptive name of the task                            |
| Description | string   | No       | Additional details about the task                             |
| CreatedBy   | string   | Yes      | User identifier of the task creator                           |
| AssignedTo  | string   | No       | User identifier of the person responsible for the task        |
| RRule       | string   | No       | RFC 5545 recurrence rule (e.g., "FREQ=WEEKLY;BYDAY=MO,WE,FR") |
| Done        | bool     | No       | Default: false. Set to true when task is completed            |
| DoneAt      | DateTime | No       | Timestamp indicating when the task was marked as done         |

## gRPC Services

The application exposes gRPC services defined in `Protos/tasks.proto` with operations including:

- `CreateTask` - Create a new task
- `GetTask` - Retrieve a specific task by ID
- `GetTasks` - List tasks with filtering options
- `UpdateTask` - Modify an existing task
- `DeleteTask` - Remove a task
- `ListUserTasks` - Get all tasks for a specific user

## Configuration

### Environment Requirements

- .NET 9.0 SDK or later
- PostgreSQL database
- Connection string configured in `appsettings.json`

### Connection String Format

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=HomeHub_tasks;Username=postgres;Password=yourpassword"
  }
}
```

## Database

### Migrations

Migrations are automatically applied on application startup. To manage migrations manually:

```bash
# Add a new migration
dotnet ef migrations add MigrationName

# View pending migrations
dotnet ef migrations list

# Update the database
dotnet ef database update
```

## Development

### Building

```bash
dotnet build HumeHub.Tasks/HumeHub.Tasks.csproj
```

### Running

```bash
dotnet run --project HumeHub.Tasks
```

The service will be available on:

- **gRPC**: `localhost:5000` (HTTP/2)
- **gRPC Web**: `localhost:5000` (HTTP/1.1 and HTTP/2)

### Testing

Run unit tests with:

```bash
dotnet test HumeHub.Tasks.Tests/
```

## Integration with HomeHub

This service is part of the larger HomeHub ecosystem and integrates with:

- HomeHub.Events (calendar/event management)
- HomeHub solution file for unified build/deployment

## API Documentation

gRPC service definitions are documented in the proto files. For detailed API specifications, refer to:

- `Protos/tasks.proto` - Service and message definitions

## Future Enhancements

- [ ] Task completion tracking
- [ ] Task deadlines and due dates
- [ ] Task priority levels
- [ ] Task categories/tags
- [ ] Task comments/notes
- [ ] REST API endpoint (gRPC-JSON transcoding)
- [ ] Swagger/OpenAPI documentation UI (Scalar)
- [ ] Email notifications for task assignments
- [ ] Task templates for common recurring tasks

## Deployment

This is a self-hosted microservice. Deploy alongside other HomeHub services in your infrastructure.

### Docker Support

A Dockerfile should be created for containerized deployment (currently not included).

## Contributing

When modifying this service:

1. Update proto files for API changes
2. Generate code from protos: `dotnet build`
3. Create corresponding migrations for database changes
4. Add/update unit tests for new functionality
5. Update this README with any architectural changes

## License

Part of the HomeHub project ecosystem.
