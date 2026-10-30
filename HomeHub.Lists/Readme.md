# HomeHub.Lists

A gRPC list service hosted by `HomeHub.Hub`. Lists are simple named collections with a string-array `Content` — groceries, wishlists, and so on.

## Data model

```csharp
public class List
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string[] Content { get; set; }
    public string CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
```

SQLite stores `Content` as JSON TEXT through `HubDbContext` in `HomeHub.Hub`.

## gRPC API

Defined in `Protos/lists.proto`:

- `CreateList` / `GetList` / `UpdateList` / `DeleteList`
- `ListLists`

## Running

```bash
dotnet run --project HomeHub.Hub
```

The service is exposed by the Hub (HTTP/2 on `localhost:5001`, gRPC-Web on both listeners).
