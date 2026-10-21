# HomeHub.Lists

A gRPC microservice for managing various types of lists in the HomeHub family management ecosystem.

## Overview

HomeHub.Lists provides a flexible list management service for creating and managing grocery lists, shopping lists, wishlists, todo lists, and any other list-based data structures. Lists can be shared with family members or kept private.

## Features

- **Multiple List Types** - Support for grocery lists, shopping lists, wishlists, and custom categories
- **List Items** - Detailed list items with counts, units, prices, and external links
- **Privacy Control** - Lists can be marked as private or shared with family
- **Flexible Metadata** - Support for categories, notes, and custom attributes per list item
- **gRPC Service** - High-performance gRPC API for list management
- **PostgreSQL Storage** - Persistent data storage with Entity Framework Core

## Data Model

### List Entity

```csharp
public class List
{
    public Guid Id { get; set; }                    // Auto-generated unique identifier
    public string Title { get; set; }               // Required: List name
    public string CreatedBy { get; set; }           // Required: User ID who created the list
    public string? Category { get; set; }           // Optional: List category (grocery, shopping, wishlist, etc.)
    public bool Private { get; set; }               // Default: false. True = private, false = shared
    public DateTime CreatedAt { get; set; }         // Timestamp when list was created
    public DateTime? UpdatedAt { get; set; }        // Timestamp of last update
    public ICollection<ListItem> Items { get; set; }  // List items
}
```

### ListItem Entity

```csharp
public class ListItem
{
    public Guid Id { get; set; }                    // Auto-generated unique identifier
    public Guid ListId { get; set; }                // Foreign key to parent List
    public string Title { get; set; }               // Required: Item name
    public int? Count { get; set; }                 // Optional: Quantity
    public string? Unit { get; set; }               // Optional: Unit of measurement (kg, L, pcs, etc.)
    public string? Link { get; set; }               // Optional: External link (product, recipe, etc.)
    public decimal? Price { get; set; }             // Optional: Item price
    public bool Completed { get; set; }             // Default: false. Mark items as done
    public DateTime CreatedAt { get; set; }         // Timestamp when item was created
}
```

## Field Descriptions

### List Entity Fields

| Field     | Type     | Required | Description                                             |
| --------- | -------- | -------- | ------------------------------------------------------- |
| Id        | Guid     | Yes      | Uniquely identifies a list                              |
| Title     | string   | Yes      | List name (e.g., "Weekly Groceries", "Christmas Gifts") |
| CreatedBy | string   | Yes      | User ID of the list creator                             |
| Category  | string   | No       | List category (grocery, shopping, wishlist, todo, etc.) |
| Private   | bool     | No       | If true, only creator can see; if false, shared         |
| CreatedAt | DateTime | No       | Timestamp of list creation                              |
| UpdatedAt | DateTime | No       | Timestamp of last modification                          |
| Items     | List     | No       | Collection of items in this list                        |

### ListItem Entity Fields

| Field     | Type     | Required | Description                                         |
| --------- | -------- | -------- | --------------------------------------------------- |
| Id        | Guid     | Yes      | Uniquely identifies a list item                     |
| ListId    | Guid     | Yes      | Foreign key reference to parent List                |
| Title     | string   | Yes      | Item name (e.g., "Milk", "Apples", "Birthday Gift") |
| Count     | int      | No       | Quantity needed (e.g., 2, 5, 10)                    |
| Unit      | string   | No       | Unit of measurement (kg, L, pcs, dozen, etc.)       |
| Link      | string   | No       | URL for product, recipe, or reference               |
| Price     | decimal  | No       | Item price for budget tracking                      |
| Completed | bool     | No       | Mark items as checked off/purchased                 |
| CreatedAt | DateTime | No       | Timestamp of item creation                          |

## gRPC Service

The service provides the following RPC methods:

- `CreateList` - Create a new list
- `GetList` - Retrieve a specific list with its items
- `UpdateList` - Update list metadata
- `DeleteList` - Delete a list
- `ListUserLists` - Get all lists for a user (private and shared)
- `AddItem` - Add an item to a list
- `UpdateItem` - Update a list item
- `RemoveItem` - Remove an item from a list
- `GetListItems` - Get all items in a list with filtering

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
dotnet build HomeHub.Lists/HomeHub.Lists.csproj
```

### Run

```bash
dotnet run --project HomeHub.Lists/HomeHub.Lists.csproj
```

The service listens on:

- gRPC: `localhost:5002`
- HTTP: `localhost:5002`

### Database Migrations

```bash
# Create initial migration
dotnet ef migrations add InitialCreate --project HomeHub.Lists

# Apply migrations
dotnet ef database update --project HomeHub.Lists
```

## Testing

Unit tests use xUnit and an in-memory database for isolation:

```bash
dotnet test HomeHub.Lists.Tests/HomeHub.Lists.Tests.csproj
```

## Future Enhancements

- [ ] List sharing with specific family members
- [ ] Collaborative editing and real-time updates (SignalR)
- [ ] List templates for common scenarios
- [ ] Integration with e-commerce platforms for price comparison
- [ ] Smart list suggestions based on history
- [ ] Recurring lists (weekly grocery lists, etc.)
- [ ] List import/export (CSV, PDF)
- [ ] Budget tracking and analytics per list category
- [ ] OCR for scanning receipts or handwritten lists
