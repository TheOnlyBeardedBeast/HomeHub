
using Google.Protobuf.WellKnownTypes;
using Grpc.Core;
using HumeHub.Tasks.Contexts;
using HumeHub.Tasks.Mappers;
using HumeHub.Tasks.Utils;
using Microsoft.EntityFrameworkCore;
using GrpcStatusCode = Grpc.Core.StatusCode;

namespace HomeHub.Tasks.Services;

public class TaskHub : TaskService.TaskServiceBase
{
    private readonly TaskDbContext _dbContext;

    public TaskHub(TaskDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    #region Task Operations

    public override async Task<CreateTaskResponse> CreateTask(CreateTaskRequest request, ServerCallContext context)
    {
        if (request.Task == null)
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, "Task cannot be null"));
        }

        var taskEntity = new HumeHub.Tasks.Entities.Task
        {
            Id = Guid.NewGuid(),
            Title = request.Task.Title,
            Description = request.Task.Description,
            CreatedBy = request.Task.CreatedBy,
            AssignedTo = request.Task.AssignedTo,
            Done = request.Task.Done,
            DoneAt = request.Task.DoneAt?.ToDateTime(),
            RecurringTaskId = string.IsNullOrEmpty(request.Task.RecurringTaskId) ? null : Guid.Parse(request.Task.RecurringTaskId)
        };

        _dbContext.Tasks.Add(taskEntity);
        await _dbContext.SaveChangesAsync();

        return new CreateTaskResponse
        {
            Id = taskEntity.Id.ToString()
        };
    }

    public override async Task<GetTaskResponse> GetTask(GetTaskRequest request, ServerCallContext context)
    {
        if (string.IsNullOrEmpty(request.Id))
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, "Task ID cannot be null or empty"));
        }

        if (!Guid.TryParse(request.Id, out var taskId))
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, "Task ID must be a valid GUID"));
        }

        var taskEntity = await _dbContext.Tasks.FindAsync(taskId);
        if (taskEntity == null)
        {
            throw new RpcException(new Status(GrpcStatusCode.NotFound, $"Task with ID {taskId} not found"));
        }

        var protoTask = TaskMappers.MapToProtoTask(taskEntity);

        return new GetTaskResponse
        {
            Task = protoTask
        };
    }

    public override async Task<Empty> UpdateTask(UpdateTaskRequest request, ServerCallContext context)
    {
        if (request.Task == null)
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, "Task cannot be null"));
        }

        if (string.IsNullOrEmpty(request.Task.Id))
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, "Task ID cannot be null or empty"));
        }

        if (!Guid.TryParse(request.Task.Id, out var taskId))
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, "Task ID must be a valid GUID"));
        }

        var taskEntity = await _dbContext.Tasks.FindAsync(taskId);
        if (taskEntity == null)
        {
            throw new RpcException(new Status(GrpcStatusCode.NotFound, $"Task with ID {taskId} not found"));
        }

        taskEntity.Title = request.Task.Title;
        taskEntity.Description = request.Task.Description;
        taskEntity.CreatedBy = request.Task.CreatedBy;
        taskEntity.AssignedTo = request.Task.AssignedTo;
        taskEntity.Done = request.Task.Done;
        taskEntity.DoneAt = request.Task.DoneAt?.ToDateTime();

        _dbContext.Tasks.Update(taskEntity);
        await _dbContext.SaveChangesAsync();

        return new Empty();
    }

    public override async Task<Empty> DeleteTask(DeleteTaskRequest request, ServerCallContext context)
    {
        if (string.IsNullOrEmpty(request.Id))
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, "Task ID cannot be null or empty"));
        }

        if (!Guid.TryParse(request.Id, out var taskId))
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, "Task ID must be a valid GUID"));
        }

        var taskEntity = await _dbContext.Tasks.FindAsync(taskId);
        if (taskEntity == null)
        {
            throw new RpcException(new Status(GrpcStatusCode.NotFound, $"Task with ID {taskId} not found"));
        }

        _dbContext.Tasks.Remove(taskEntity);
        await _dbContext.SaveChangesAsync();

        return new Empty();
    }

    public override async Task<ListTasksResponse> ListTasks(ListTasksRequest request, ServerCallContext context)
    {
        var query = _dbContext.Tasks.AsQueryable();

        if (!string.IsNullOrEmpty(request.AssignedTo))
        {
            query = query.Where(t => t.AssignedTo == request.AssignedTo);
        }

        if (request.DoneOnly)
        {
            query = query.Where(t => t.Done);
        }

        var tasks = await query.ToListAsync();
        var response = new ListTasksResponse();
        response.Tasks.AddRange(tasks.Select(TaskMappers.MapToProtoTask));

        return response;
    }

    public override async Task<GetMyTasksResponse> GetMyTasks(GetMyTasksRequest request, ServerCallContext context)
    {
        // Note: In a real implementation, you'd get the current user from context
        var query = _dbContext.Tasks.AsQueryable();

        if (request.DoneOnly)
        {
            query = query.Where(t => t.Done);
        }

        var tasks = await query.ToListAsync();
        var response = new GetMyTasksResponse();
        response.Tasks.AddRange(tasks.Select(TaskMappers.MapToProtoTask));

        return response;
    }

    #endregion

    #region RecurringTask Operations

    public override async Task<CreateRecurringTaskResponse> CreateRecurringTask(CreateRecurringTaskRequest request, ServerCallContext context)
    {
        if (request.RecurringTask == null)
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, "RecurringTask cannot be null"));
        }

        if (string.IsNullOrEmpty(request.RecurringTask.Rrule))
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, "RRule cannot be null or empty"));
        }

        var recurringTaskEntity = new HumeHub.Tasks.Entities.RecurringTask
        {
            Id = Guid.NewGuid(),
            Title = request.RecurringTask.Title,
            Description = request.RecurringTask.Description,
            CreatedBy = request.RecurringTask.CreatedBy,
            AssignedTo = request.RecurringTask.AssignedTo,
            RRule = request.RecurringTask.Rrule,
            CreatedAt = request.RecurringTask.CreatedAt?.ToDateTime() ?? DateTime.UtcNow
        };

        _dbContext.RecurringTasks.Add(recurringTaskEntity);
        await _dbContext.SaveChangesAsync();

        return new CreateRecurringTaskResponse
        {
            Id = recurringTaskEntity.Id.ToString()
        };
    }

    public override async Task<GetRecurringTaskResponse> GetRecurringTask(GetRecurringTaskRequest request, ServerCallContext context)
    {
        if (string.IsNullOrEmpty(request.Id))
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, "RecurringTask ID cannot be null or empty"));
        }

        if (!Guid.TryParse(request.Id, out var recurringTaskId))
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, "RecurringTask ID must be a valid GUID"));
        }

        var recurringTaskEntity = await _dbContext.RecurringTasks
            .Include(rt => rt.Instances)
            .FirstOrDefaultAsync(rt => rt.Id == recurringTaskId);

        if (recurringTaskEntity == null)
        {
            throw new RpcException(new Status(GrpcStatusCode.NotFound, $"RecurringTask with ID {recurringTaskId} not found"));
        }

        var protoRecurringTask = TaskMappers.MapToProtoRecurringTask(recurringTaskEntity);
        var response = new GetRecurringTaskResponse
        {
            RecurringTask = protoRecurringTask
        };

        response.Instances.AddRange(recurringTaskEntity.Instances.Select(TaskMappers.MapToProtoTask));

        return response;
    }

    public override async Task<Empty> UpdateRecurringTask(UpdateRecurringTaskRequest request, ServerCallContext context)
    {
        if (request.RecurringTask == null)
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, "RecurringTask cannot be null"));
        }

        if (string.IsNullOrEmpty(request.RecurringTask.Id))
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, "RecurringTask ID cannot be null or empty"));
        }

        if (!Guid.TryParse(request.RecurringTask.Id, out var recurringTaskId))
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, "RecurringTask ID must be a valid GUID"));
        }

        var recurringTaskEntity = await _dbContext.RecurringTasks.FindAsync(recurringTaskId);
        if (recurringTaskEntity == null)
        {
            throw new RpcException(new Status(GrpcStatusCode.NotFound, $"RecurringTask with ID {recurringTaskId} not found"));
        }

        recurringTaskEntity.Title = request.RecurringTask.Title;
        recurringTaskEntity.Description = request.RecurringTask.Description;
        recurringTaskEntity.CreatedBy = request.RecurringTask.CreatedBy;
        recurringTaskEntity.AssignedTo = request.RecurringTask.AssignedTo;
        recurringTaskEntity.RRule = request.RecurringTask.Rrule;

        _dbContext.RecurringTasks.Update(recurringTaskEntity);
        await _dbContext.SaveChangesAsync();

        return new Empty();
    }

    public override async Task<Empty> DeleteRecurringTask(DeleteRecurringTaskRequest request, ServerCallContext context)
    {
        if (string.IsNullOrEmpty(request.Id))
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, "RecurringTask ID cannot be null or empty"));
        }

        if (!Guid.TryParse(request.Id, out var recurringTaskId))
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, "RecurringTask ID must be a valid GUID"));
        }

        var recurringTaskEntity = await _dbContext.RecurringTasks.FindAsync(recurringTaskId);
        if (recurringTaskEntity == null)
        {
            throw new RpcException(new Status(GrpcStatusCode.NotFound, $"RecurringTask with ID {recurringTaskId} not found"));
        }

        _dbContext.RecurringTasks.Remove(recurringTaskEntity);
        await _dbContext.SaveChangesAsync();

        return new Empty();
    }

    public override async Task<ListRecurringTasksResponse> ListRecurringTasks(ListRecurringTasksRequest request, ServerCallContext context)
    {
        var query = _dbContext.RecurringTasks.AsQueryable();

        if (!string.IsNullOrEmpty(request.AssignedTo))
        {
            query = query.Where(rt => rt.AssignedTo == request.AssignedTo);
        }

        var recurringTasks = await query.ToListAsync();
        var response = new ListRecurringTasksResponse();
        response.RecurringTasks.AddRange(recurringTasks.Select(TaskMappers.MapToProtoRecurringTask));

        return response;
    }

    public override async Task<GetMyRecurringTasksResponse> GetMyRecurringTasks(GetMyRecurringTasksRequest request, ServerCallContext context)
    {
        // Note: In a real implementation, you'd get the current user from context
        var recurringTasks = await _dbContext.RecurringTasks.ToListAsync();
        var response = new GetMyRecurringTasksResponse();
        response.RecurringTasks.AddRange(recurringTasks.Select(TaskMappers.MapToProtoRecurringTask));

        return response;
    }

    public override async Task<GetTasksInRangeResponse> GetTasksInRange(GetTasksInRangeRequest request, ServerCallContext context)
    {
        if (request.Range == null)
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, "Date range cannot be null"));
        }

        var rangeStart = request.Range.Start.ToDateTime();
        var rangeEnd = request.Range.End.ToDateTime();

        // Get all regular tasks (not linked to recurring tasks) that match criteria:
        // - Not done yet, OR
        // - Were marked done within the range
        var regularTasks = await _dbContext.Tasks
            .Where(t => t.RecurringTaskId == null &&
                       (!t.Done || (t.DoneAt.HasValue && t.DoneAt >= rangeStart && t.DoneAt <= rangeEnd)))
            .ToListAsync();

        // Get all done instances from recurring tasks within the range (to track what's already done)
        var doneRecurringTaskInstances = await _dbContext.Tasks
            .Where(t => t.RecurringTaskId.HasValue &&
                       t.Done &&
                       t.DoneAt.HasValue &&
                       t.DoneAt >= rangeStart &&
                       t.DoneAt <= rangeEnd)
            .ToListAsync();

        var response = new GetTasksInRangeResponse();

        // Add regular tasks
        response.Tasks.AddRange(regularTasks.Select(TaskMappers.MapToProtoTask));

        // Get all recurring tasks and generate occurrences within range
        var recurringTasks = await _dbContext.RecurringTasks.ToListAsync();

        foreach (var recurringTask in recurringTasks)
        {
            var occurrences = RecurrenceUtils.GenerateRecurringTaskOccurrences(recurringTask, rangeStart, rangeEnd);

            foreach (var occurrence in occurrences)
            {
                // Check if there's a corresponding done instance from the recurring task for this specific date
                var doneInstance = doneRecurringTaskInstances.FirstOrDefault(
                    t => t.RecurringTaskId == recurringTask.Id &&
                         t.DoneAt.HasValue &&
                         t.DoneAt.Value.Date == occurrence.CreatedAt.Date);

                // Only add if there's no corresponding done instance (avoid duplication)
                if (doneInstance == null)
                {
                    response.Tasks.Add(TaskMappers.MapToProtoTask(occurrence));
                }
            }
        }

        return response;
    }

    #endregion
}