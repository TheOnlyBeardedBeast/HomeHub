using Google.Protobuf.WellKnownTypes;
using HomeHub.Tasks;

namespace HumeHub.Tasks.Mappers;

public static class TaskMappers
{
    public static HomeHub.Tasks.Task MapToProtoTask(Entities.Task taskEntity)
    {
        var protoTask = new HomeHub.Tasks.Task
        {
            Id = taskEntity.Id.ToString(),
            Title = taskEntity.Title,
            Description = taskEntity.Description ?? string.Empty,
            CreatedBy = taskEntity.CreatedBy,
            AssignedTo = taskEntity.AssignedTo ?? string.Empty,
            Done = taskEntity.Done,
            RecurringTaskId = taskEntity.RecurringTaskId?.ToString() ?? string.Empty
        };

        if (taskEntity.DoneAt.HasValue)
        {
            protoTask.DoneAt = Timestamp.FromDateTime(taskEntity.DoneAt.Value);
        }

        return protoTask;
    }

    public static RecurringTask MapToProtoRecurringTask(Entities.RecurringTask recurringTaskEntity)
    {
        var protoRecurringTask = new RecurringTask
        {
            Id = recurringTaskEntity.Id.ToString(),
            Title = recurringTaskEntity.Title,
            Description = recurringTaskEntity.Description ?? string.Empty,
            CreatedBy = recurringTaskEntity.CreatedBy,
            AssignedTo = recurringTaskEntity.AssignedTo ?? string.Empty,
            Rrule = recurringTaskEntity.RRule,
            CreatedAt = Timestamp.FromDateTime(recurringTaskEntity.CreatedAt)
        };

        return protoRecurringTask;
    }
}
