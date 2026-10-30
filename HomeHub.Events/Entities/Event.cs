using System;

namespace HomeHub.Events.Entities;

public class Event
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid Organizer { get; set; }
    public DateTime Start { get; set; }
    public DateTime? End { get; set; }
    public string[]? Rrules { get; set; }
    public string Category { get; set; } = string.Empty;
    public DateTime[]? ExceptDates { get; set; }
    public bool AllDay { get; set; } = false;
}