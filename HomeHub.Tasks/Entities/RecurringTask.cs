namespace HumeHub.Tasks.Entities;

public class RecurringTask
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid CreatedBy { get; set; }
    public Guid? AssignedTo { get; set; }
    public string RRule { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public ICollection<Task> Instances { get; set; } = new List<Task>();
}
