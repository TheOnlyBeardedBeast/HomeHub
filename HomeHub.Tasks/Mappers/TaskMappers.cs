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
            CreatedBy = taskEntity.CreatedBy.ToString(),
            Done = taskEntity.Done,
            CreatedAt = Timestamp.FromDateTime(taskEntity.CreatedAt)
        };

        if (taskEntity.AssignedTo.HasValue)
        {
            protoTask.AssignedTo = taskEntity.AssignedTo.Value.ToString();
        }

        if (taskEntity.RecurringTaskId.HasValue)
        {
            protoTask.RecurringTaskId = taskEntity.RecurringTaskId.Value.ToString();
        }

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
            CreatedBy = recurringTaskEntity.CreatedBy.ToString(),
            Rrule = recurringTaskEntity.RRule,
            CreatedAt = Timestamp.FromDateTime(recurringTaskEntity.CreatedAt)
        };

        if (recurringTaskEntity.AssignedTo.HasValue)
        {
            protoRecurringTask.AssignedTo = recurringTaskEntity.AssignedTo.Value.ToString();
        }

        return protoRecurringTask;
    }
}
