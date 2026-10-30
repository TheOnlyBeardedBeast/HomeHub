namespace HomeHub.Lists.Entities;

public class List
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string[] Content { get; set; } = [];
    public Guid CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
