namespace HumeHub.Tasks.Entities;

public class Task
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid CreatedBy { get; set; }
    public Guid? AssignedTo { get; set; }
    public bool Done { get; set; } = false;
    public DateTime? DoneAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Foreign key to recurring task (null for non-recurring tasks)
    public Guid? RecurringTaskId { get; set; }

    // Navigation property
    public RecurringTask? RecurringTask { get; set; }
}
