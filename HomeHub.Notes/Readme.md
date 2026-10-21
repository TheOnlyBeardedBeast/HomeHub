# HomeHub.Notes

A gRPC microservice for managing notes and sticky notes in the HomeHub family management ecosystem.

## Overview

HomeHub.Notes provides a simple yet flexible note management service for creating and organizing notes with family members. Notes support Markdown formatting for rich text formatting options.

## Features

- **Markdown Support** - Rich text formatting with Markdown syntax
- **Easy Organization** - Search and filter notes by creation date, content, or ownership
- **User-Specific Views** - Each user can see their own notes plus shared family notes
- **Timestamps** - Track creation and modification dates
- **gRPC Service** - High-performance gRPC API for note management
- **PostgreSQL Storage** - Persistent data storage with Entity Framework Core

## Data Model

### Note Entity

```csharp
public class Note
{
    public Guid Id { get; set; }                    // Auto-generated unique identifier
    public string Title { get; set; }               // Required: Note title
    public string Content { get; set; }             // Required: Note content (supports Markdown)
    public string CreatedBy { get; set; }           // Required: User ID who created the note
    public DateTime CreatedAt { get; set; }         // Timestamp when note was created
    public DateTime? UpdatedAt { get; set; }        // Timestamp of last modification
}
```

## Field Descriptions

| Field     | Type     | Required | Description                                   |
| --------- | -------- | -------- | --------------------------------------------- |
| Id        | Guid     | Yes      | Uniquely identifies a note                    |
| Title     | string   | Yes      | Note title or subject                         |
| Content   | string   | Yes      | Note content with Markdown formatting support |
| CreatedBy | string   | Yes      | User ID of the note creator                   |
| CreatedAt | DateTime | No       | Timestamp of note creation                    |
| UpdatedAt | DateTime | No       | Timestamp of last modification                |

## gRPC Service

The service provides the following RPC methods:

- `CreateNote` - Create a new note
- `GetNote` - Retrieve a specific note by ID
- `UpdateNote` - Update note content and metadata
- `DeleteNote` - Delete a note
- `ListNotes` - Get all notes
- `SearchNotes` - Search notes by title or content

## Configuration

### Environment Variables

```bash
DATABASE_URL=postgresql://user:password@localhost/HomeHub
ASPNETCORE_ENVIRONMENT=Development
```

### appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=HomeHub;Username=postgres;Password=password"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  }
}
```

## Development

### Prerequisites

- .NET 9.0 SDK
- PostgreSQL 12+

### Build

```bash
dotnet build HomeHub.Notes/HomeHub.Notes.csproj
```

### Run

```bash
dotnet run --project HomeHub.Notes/HomeHub.Notes.csproj
```

The service listens on:

- gRPC: `localhost:5003`
- HTTP: `localhost:5003`

### Database Migrations

```bash
# Create initial migration
dotnet ef migrations add InitialCreate --project HomeHub.Notes

# Apply migrations
dotnet ef database update --project HomeHub.Notes
```

## Testing

Unit tests use xUnit and an in-memory database for isolation:

```bash
dotnet test HomeHub.Notes.Tests/HomeHub.Notes.Tests.csproj
```

## Markdown Support

Notes support standard Markdown formatting:

```markdown
# Heading 1

## Heading 2

**Bold text**
_Italic text_
~~Strikethrough~~

- Bullet list
- Another item

1. Numbered list
2. Another item

[Link text](https://example.com)

`code`

`code block`
```

## Future Enhancements

- [ ] Rich text editor with preview
- [ ] Collaboration and real-time editing (SignalR)
- [ ] Tags and categories for note organization
- [ ] Note templates
- [ ] Pin important notes to top
- [ ] Note sharing with specific family members
- [ ] Export notes as PDF or Markdown
- [ ] Full-text search with indexing
- [ ] Note reminders/notifications
- [ ] Notebook/folder organization
