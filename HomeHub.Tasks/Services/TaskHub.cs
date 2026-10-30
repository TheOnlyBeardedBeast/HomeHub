using Google.Protobuf.WellKnownTypes;
using Grpc.Core;
using HomeHub.Users.Security;
using HumeHub.Tasks.Contexts;
using HumeHub.Tasks.Mappers;
using HumeHub.Tasks.Utils;
using Microsoft.EntityFrameworkCore;
using GrpcStatusCode = Grpc.Core.StatusCode;

namespace HomeHub.Tasks.Services;

public class TaskHub : TaskService.TaskServiceBase
{
    private readonly ITaskDbContext _dbContext;
    private readonly CurrentUser _currentUser;

    public TaskHub(ITaskDbContext dbContext, CurrentUser currentUser)
    {
        _dbContext = dbContext;
        _currentUser = currentUser;
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
            CreatedBy = _currentUser.RequireUserId(),
            AssignedTo = ParseOptionalUserId(request.Task.AssignedTo, "AssignedTo"),
            Done = request.Task.Done,
            DoneAt = request.Task.Done ? DateTime.UtcNow : null,
            CreatedAt = request.Task.CreatedAt?.ToDateTime() ?? DateTime.UtcNow,
            RecurringTaskId = ParseOptionalUserId(request.Task.RecurringTaskId, "RecurringTaskId")
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

        return new GetTaskResponse
        {
            Task = TaskMappers.MapToProtoTask(taskEntity)
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
        taskEntity.AssignedTo = ParseOptionalUserId(request.Task.AssignedTo, "AssignedTo");
        taskEntity.Done = request.Task.Done;
        taskEntity.DoneAt = request.Task.Done
            ? taskEntity.DoneAt ?? DateTime.UtcNow
            : null;

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

        var assignedTo = ParseOptionalUserId(request.AssignedTo, "AssignedTo");
        if (assignedTo.HasValue)
        {
            query = query.Where(t => t.AssignedTo == assignedTo);
        }

        if (request.DoneOnly)
        {
            query = query.Where(t => t.Done);
        }

        var tasks = await query.OrderByDescending(t => t.CreatedAt).ToListAsync();
        var response = new ListTasksResponse();
        response.Tasks.AddRange(tasks.Select(TaskMappers.MapToProtoTask));

        return response;
    }

    public override async Task<GetMyTasksResponse> GetMyTasks(GetMyTasksRequest request, ServerCallContext context)
    {
        var userId = _currentUser.RequireUserId();
        var query = _dbContext.Tasks.Where(t => t.AssignedTo == userId);

        if (request.DoneOnly)
        {
            query = query.Where(t => t.Done);
        }

        var tasks = await query.OrderByDescending(t => t.CreatedAt).ToListAsync();
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

        if (!RecurrenceUtils.IsValidRRule(request.RecurringTask.Rrule))
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, "RRule must be a valid recurrence rule"));
        }

        var recurringTaskEntity = new HumeHub.Tasks.Entities.RecurringTask
        {
            Id = Guid.NewGuid(),
            Title = request.RecurringTask.Title,
            Description = request.RecurringTask.Description,
            CreatedBy = _currentUser.RequireUserId(),
            AssignedTo = ParseOptionalUserId(request.RecurringTask.AssignedTo, "AssignedTo"),
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

        var response = new GetRecurringTaskResponse
        {
            RecurringTask = TaskMappers.MapToProtoRecurringTask(recurringTaskEntity)
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

        if (!RecurrenceUtils.IsValidRRule(request.RecurringTask.Rrule))
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, "RRule must be a valid recurrence rule"));
        }

        var recurringTaskEntity = await _dbContext.RecurringTasks.FindAsync(recurringTaskId);
        if (recurringTaskEntity == null)
        {
            throw new RpcException(new Status(GrpcStatusCode.NotFound, $"RecurringTask with ID {recurringTaskId} not found"));
        }

        // CreatedBy and CreatedAt (the recurrence start) are immutable.
        recurringTaskEntity.Title = request.RecurringTask.Title;
        recurringTaskEntity.Description = request.RecurringTask.Description;
        recurringTaskEntity.AssignedTo = ParseOptionalUserId(request.RecurringTask.AssignedTo, "AssignedTo");
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

        var assignedTo = ParseOptionalUserId(request.AssignedTo, "AssignedTo");
        if (assignedTo.HasValue)
        {
            query = query.Where(rt => rt.AssignedTo == assignedTo);
        }

        var recurringTasks = await query.OrderBy(rt => rt.Title).ToListAsync();
        var response = new ListRecurringTasksResponse();
        response.RecurringTasks.AddRange(recurringTasks.Select(TaskMappers.MapToProtoRecurringTask));

        return response;
    }

    public override async Task<GetMyRecurringTasksResponse> GetMyRecurringTasks(GetMyRecurringTasksRequest request, ServerCallContext context)
    {
        var userId = _currentUser.RequireUserId();
        var recurringTasks = await _dbContext.RecurringTasks
            .Where(rt => rt.AssignedTo == userId)
            .OrderBy(rt => rt.Title)
            .ToListAsync();

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

        if (request.Range.Start == null || request.Range.End == null)
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, "Date range start and end are required"));
        }

        var rangeStart = request.Range.Start.ToDateTime();
        var rangeEnd = request.Range.End.ToDateTime();

        if (rangeStart >= rangeEnd)
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, "Date range start must be before end"));
        }

        // Get all regular tasks (not linked to recurring tasks) that match criteria:
        // - Not done yet, OR
        // - Were marked done within the range
        var regularTasks = await _dbContext.Tasks
            .Where(t => t.RecurringTaskId == null &&
                       (!t.Done || (t.DoneAt.HasValue && t.DoneAt >= rangeStart && t.DoneAt <= rangeEnd)))
            .ToListAsync();

        // Completed recurring instances are matched by their occurrence date (CreatedAt),
        // not by when they happened to be checked off.
        var completedRecurringInstances = await _dbContext.Tasks
            .Where(t => t.RecurringTaskId.HasValue &&
                       t.Done &&
                       t.CreatedAt >= rangeStart &&
                       t.CreatedAt <= rangeEnd)
            .ToListAsync();

        var response = new GetTasksInRangeResponse();
        response.Tasks.AddRange(regularTasks.Select(TaskMappers.MapToProtoTask));
        response.Tasks.AddRange(completedRecurringInstances.Select(TaskMappers.MapToProtoTask));

        // Get all recurring tasks and generate occurrences within range
        var recurringTasks = await _dbContext.RecurringTasks.ToListAsync();

        foreach (var recurringTask in recurringTasks)
        {
            var occurrences = RecurrenceUtils.GenerateRecurringTaskOccurrences(recurringTask, rangeStart, rangeEnd);

            foreach (var occurrence in occurrences)
            {
                var alreadyCompleted = completedRecurringInstances.Any(
                    t => t.RecurringTaskId == recurringTask.Id && t.CreatedAt == occurrence.CreatedAt);

                if (!alreadyCompleted)
                {
                    response.Tasks.Add(TaskMappers.MapToProtoTask(occurrence));
                }
            }
        }

        return response;
    }

    #endregion

    private static Guid? ParseOptionalUserId(string? value, string fieldName)
    {
        if (string.IsNullOrEmpty(value))
        {
            return null;
        }

        if (!Guid.TryParse(value, out var id))
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, $"{fieldName} must be a valid user ID"));
        }

        return id;
    }
}
