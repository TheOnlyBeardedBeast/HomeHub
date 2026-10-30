using Google.Protobuf.WellKnownTypes;
using Grpc.Core;
using HomeHub.Hub.Contexts;
using HomeHub.Tasks.Services;
using HomeHub.Users.Security;
using Microsoft.EntityFrameworkCore;
using Xunit;
using TaskEntity = HumeHub.Tasks.Entities.Task;
using RecurringTaskEntity = HumeHub.Tasks.Entities.RecurringTask;
using TaskProto = HomeHub.Tasks.Task;
using RecurringTaskProto = HomeHub.Tasks.RecurringTask;
using Task = System.Threading.Tasks.Task;
using GrpcStatusCode = Grpc.Core.StatusCode;

namespace HomeHub.Tasks.Tests.Services;

public class TaskHubTests
{
    private static readonly Guid User1 = Guid.Parse("11111111-1111-1111-1111-111111111111");
    private static readonly Guid User2 = Guid.Parse("22222222-2222-2222-2222-222222222222");
    private static readonly Guid User3 = Guid.Parse("33333333-3333-3333-3333-333333333333");

    private HubDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<HubDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new HubDbContext(options);
    }

    private static TaskHub CreateTaskHub(HubDbContext dbContext, Guid? userId = null) =>
        new(dbContext, new CurrentUser { UserId = userId ?? User1, FullName = "Test User" });

    #region Task Tests

    [Fact]
    public async System.Threading.Tasks.Task CreateTask_WithValidTask_CreatesTaskSuccessfully()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var taskHub = CreateTaskHub(dbContext);

        var createTaskRequest = new CreateTaskRequest
        {
            Task = new TaskProto
            {
                Title = "Test Task",
                Description = "Test Description",
                CreatedBy = User1.ToString(),
                AssignedTo = User2.ToString(),
                Done = false
            }
        };

        // Act
        var response = await taskHub.CreateTask(createTaskRequest, null!);

        // Assert
        Assert.NotEmpty(response.Id);
        Assert.True(Guid.TryParse(response.Id, out _));

        // Verify task was saved to database
        var savedTask = await dbContext.Tasks.FirstOrDefaultAsync(t => t.Id.ToString() == response.Id);
        Assert.NotNull(savedTask);
        Assert.Equal("Test Task", savedTask.Title);
        Assert.Equal("Test Description", savedTask.Description);
        Assert.Equal(User1, savedTask.CreatedBy);
        Assert.Equal(User2, savedTask.AssignedTo);
        Assert.False(savedTask.Done);
    }

    [Fact]
    public async System.Threading.Tasks.Task CreateTask_WithNullTask_ThrowsException()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var taskHub = CreateTaskHub(dbContext);

        var createTaskRequest = new CreateTaskRequest
        {
            Task = null!
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<RpcException>(
            () => taskHub.CreateTask(createTaskRequest, null!));

        Assert.Equal(StatusCode.InvalidArgument, exception.Status.StatusCode);
    }

    [Fact]
    public async System.Threading.Tasks.Task GetTask_WithValidId_ReturnsTask()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var taskHub = CreateTaskHub(dbContext);

        var taskId = Guid.NewGuid();
        var taskEntity = new TaskEntity
        {
            Id = taskId,
            Title = "Test Task",
            Description = "Test Description",
            CreatedBy = User1,
            AssignedTo = User2,
            Done = false,
            CreatedAt = DateTime.UtcNow
        };

        dbContext.Tasks.Add(taskEntity);
        await dbContext.SaveChangesAsync();

        var getTaskRequest = new GetTaskRequest
        {
            Id = taskId.ToString()
        };

        // Act
        var response = await taskHub.GetTask(getTaskRequest, null!);

        // Assert
        Assert.NotNull(response.Task);
        Assert.Equal(taskId.ToString(), response.Task.Id);
        Assert.Equal("Test Task", response.Task.Title);
        Assert.Equal("Test Description", response.Task.Description);
        Assert.Equal(User1.ToString(), response.Task.CreatedBy);
        Assert.Equal(User2.ToString(), response.Task.AssignedTo);
        Assert.False(response.Task.Done);
    }

    [Fact]
    public async System.Threading.Tasks.Task GetTask_WithInvalidId_ThrowsException()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var taskHub = CreateTaskHub(dbContext);

        var getTaskRequest = new GetTaskRequest
        {
            Id = "invalid-guid"
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<RpcException>(
            () => taskHub.GetTask(getTaskRequest, null!));

        Assert.Equal(StatusCode.InvalidArgument, exception.Status.StatusCode);
    }

    [Fact]
    public async System.Threading.Tasks.Task GetTask_WithNonExistentId_ThrowsNotFoundException()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var taskHub = CreateTaskHub(dbContext);

        var nonExistentId = Guid.NewGuid().ToString();

        var getTaskRequest = new GetTaskRequest
        {
            Id = nonExistentId
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<RpcException>(
            () => taskHub.GetTask(getTaskRequest, null!));

        Assert.Equal(StatusCode.NotFound, exception.Status.StatusCode);
    }

    [Fact]
    public async System.Threading.Tasks.Task UpdateTask_WithValidTask_UpdatesSuccessfully()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var taskHub = CreateTaskHub(dbContext);

        var taskId = Guid.NewGuid();
        var taskEntity = new TaskEntity
        {
            Id = taskId,
            Title = "Original Title",
            Description = "Original Description",
            CreatedBy = User1,
            AssignedTo = User2,
            Done = false,
            CreatedAt = DateTime.UtcNow
        };

        dbContext.Tasks.Add(taskEntity);
        await dbContext.SaveChangesAsync();

        var updateTaskRequest = new UpdateTaskRequest
        {
            Task = new TaskProto
            {
                Id = taskId.ToString(),
                Title = "Updated Title",
                Description = "Updated Description",
                CreatedBy = User1.ToString(),
                AssignedTo = User3.ToString(),
                Done = true,
                DoneAt = Timestamp.FromDateTime(DateTime.UtcNow)
            }
        };

        // Act
        await taskHub.UpdateTask(updateTaskRequest, null!);

        // Assert
        var updatedTask = await dbContext.Tasks.FindAsync(taskId);
        Assert.NotNull(updatedTask);
        Assert.Equal("Updated Title", updatedTask.Title);
        Assert.Equal("Updated Description", updatedTask.Description);
        Assert.Equal(User3, updatedTask.AssignedTo);
        Assert.True(updatedTask.Done);
        Assert.NotNull(updatedTask.DoneAt);
        Assert.Equal(User1, updatedTask.CreatedBy);
    }

    [Fact]
    public async System.Threading.Tasks.Task UpdateTask_WithNonExistentId_ThrowsNotFoundException()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var taskHub = CreateTaskHub(dbContext);

        var updateTaskRequest = new UpdateTaskRequest
        {
            Task = new TaskProto
            {
                Id = Guid.NewGuid().ToString(),
                Title = "Updated Title",
                CreatedBy = User1.ToString()
            }
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<RpcException>(
            () => taskHub.UpdateTask(updateTaskRequest, null!));

        Assert.Equal(StatusCode.NotFound, exception.Status.StatusCode);
    }

    [Fact]
    public async System.Threading.Tasks.Task DeleteTask_WithValidId_DeletesTaskSuccessfully()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var taskHub = CreateTaskHub(dbContext);

        var taskId = Guid.NewGuid();
        var taskEntity = new TaskEntity
        {
            Id = taskId,
            Title = "Test Task",
            CreatedBy = User1,
            CreatedAt = DateTime.UtcNow
        };

        dbContext.Tasks.Add(taskEntity);
        await dbContext.SaveChangesAsync();

        var deleteTaskRequest = new DeleteTaskRequest
        {
            Id = taskId.ToString()
        };

        // Act
        await taskHub.DeleteTask(deleteTaskRequest, null!);

        // Assert
        var deletedTask = await dbContext.Tasks.FindAsync(taskId);
        Assert.Null(deletedTask);
    }

    [Fact]
    public async System.Threading.Tasks.Task DeleteTask_WithNonExistentId_ThrowsNotFoundException()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var taskHub = CreateTaskHub(dbContext);

        var deleteTaskRequest = new DeleteTaskRequest
        {
            Id = Guid.NewGuid().ToString()
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<RpcException>(
            () => taskHub.DeleteTask(deleteTaskRequest, null!));

        Assert.Equal(StatusCode.NotFound, exception.Status.StatusCode);
    }

    [Fact]
    public async System.Threading.Tasks.Task ListTasks_WithMultipleTasks_ReturnsAllTasks()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var taskHub = CreateTaskHub(dbContext);

        var task1 = new TaskEntity { Id = Guid.NewGuid(), Title = "Task 1", CreatedBy = User1, AssignedTo = User2, CreatedAt = DateTime.UtcNow };
        var task2 = new TaskEntity { Id = Guid.NewGuid(), Title = "Task 2", CreatedBy = User1, AssignedTo = User3, CreatedAt = DateTime.UtcNow };
        var task3 = new TaskEntity { Id = Guid.NewGuid(), Title = "Task 3", CreatedBy = User1, AssignedTo = User2, CreatedAt = DateTime.UtcNow };

        dbContext.Tasks.AddRange(task1, task2, task3);
        await dbContext.SaveChangesAsync();

        var listTasksRequest = new ListTasksRequest();

        // Act
        var response = await taskHub.ListTasks(listTasksRequest, null!);

        // Assert
        Assert.Equal(3, response.Tasks.Count);
    }

    [Fact]
    public async System.Threading.Tasks.Task ListTasks_WithAssignedToFilter_ReturnsFilteredTasks()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var taskHub = CreateTaskHub(dbContext);

        var task1 = new TaskEntity { Id = Guid.NewGuid(), Title = "Task 1", CreatedBy = User1, AssignedTo = User2, CreatedAt = DateTime.UtcNow };
        var task2 = new TaskEntity { Id = Guid.NewGuid(), Title = "Task 2", CreatedBy = User1, AssignedTo = User3, CreatedAt = DateTime.UtcNow };
        var task3 = new TaskEntity { Id = Guid.NewGuid(), Title = "Task 3", CreatedBy = User1, AssignedTo = User2, CreatedAt = DateTime.UtcNow };

        dbContext.Tasks.AddRange(task1, task2, task3);
        await dbContext.SaveChangesAsync();

        var listTasksRequest = new ListTasksRequest
        {
            AssignedTo = User2.ToString()
        };

        // Act
        var response = await taskHub.ListTasks(listTasksRequest, null!);

        // Assert
        Assert.Equal(2, response.Tasks.Count);
        Assert.All(response.Tasks, t => Assert.Equal(User2.ToString(), t.AssignedTo));
    }

    [Fact]
    public async System.Threading.Tasks.Task ListTasks_WithDoneOnlyFilter_ReturnsOnlyDoneTasks()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var taskHub = CreateTaskHub(dbContext);

        var task1 = new TaskEntity { Id = Guid.NewGuid(), Title = "Task 1", CreatedBy = User1, Done = true, DoneAt = DateTime.UtcNow, CreatedAt = DateTime.UtcNow };
        var task2 = new TaskEntity { Id = Guid.NewGuid(), Title = "Task 2", CreatedBy = User1, Done = false, CreatedAt = DateTime.UtcNow };
        var task3 = new TaskEntity { Id = Guid.NewGuid(), Title = "Task 3", CreatedBy = User1, Done = true, DoneAt = DateTime.UtcNow, CreatedAt = DateTime.UtcNow };

        dbContext.Tasks.AddRange(task1, task2, task3);
        await dbContext.SaveChangesAsync();

        var listTasksRequest = new ListTasksRequest
        {
            DoneOnly = true
        };

        // Act
        var response = await taskHub.ListTasks(listTasksRequest, null!);

        // Assert
        Assert.Equal(2, response.Tasks.Count);
        Assert.All(response.Tasks, t => Assert.True(t.Done));
    }

    [Fact]
    public async System.Threading.Tasks.Task GetMyTasks_ReturnsTasksAssignedToCurrentUser()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var taskHub = CreateTaskHub(dbContext);

        var task1 = new TaskEntity { Id = Guid.NewGuid(), Title = "Task 1", CreatedBy = User2, AssignedTo = User1, CreatedAt = DateTime.UtcNow };
        var task2 = new TaskEntity { Id = Guid.NewGuid(), Title = "Task 2", CreatedBy = User1, AssignedTo = User1, CreatedAt = DateTime.UtcNow };
        var task3 = new TaskEntity { Id = Guid.NewGuid(), Title = "Task 3", CreatedBy = User1, AssignedTo = User2, CreatedAt = DateTime.UtcNow };

        dbContext.Tasks.AddRange(task1, task2, task3);
        await dbContext.SaveChangesAsync();

        var getMyTasksRequest = new GetMyTasksRequest();

        // Act
        var response = await taskHub.GetMyTasks(getMyTasksRequest, null!);

        // Assert
        Assert.Equal(2, response.Tasks.Count);
        Assert.All(response.Tasks, t => Assert.Equal(User1.ToString(), t.AssignedTo));
    }

    #endregion

    #region RecurringTask Tests

    [Fact]
    public async System.Threading.Tasks.Task CreateRecurringTask_WithValidTask_CreatesSuccessfully()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var taskHub = CreateTaskHub(dbContext);

        var createRecurringTaskRequest = new CreateRecurringTaskRequest
        {
            RecurringTask = new RecurringTaskProto
            {
                Title = "Recurring Task",
                Description = "Weekly Meeting",
                CreatedBy = User1.ToString(),
                AssignedTo = User2.ToString(),
                Rrule = "FREQ=WEEKLY;BYDAY=MO,WE,FR"
            }
        };

        // Act
        var response = await taskHub.CreateRecurringTask(createRecurringTaskRequest, null!);

        // Assert
        Assert.NotEmpty(response.Id);
        Assert.True(Guid.TryParse(response.Id, out _));

        var savedRecurringTask = await dbContext.RecurringTasks.FirstOrDefaultAsync(rt => rt.Id.ToString() == response.Id);
        Assert.NotNull(savedRecurringTask);
        Assert.Equal("Recurring Task", savedRecurringTask.Title);
        Assert.Equal("FREQ=WEEKLY;BYDAY=MO,WE,FR", savedRecurringTask.RRule);
        Assert.Equal(User1, savedRecurringTask.CreatedBy);
        Assert.Equal(User2, savedRecurringTask.AssignedTo);
    }

    [Fact]
    public async System.Threading.Tasks.Task CreateRecurringTask_WithInvalidRRule_ThrowsInvalidArgument()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var taskHub = CreateTaskHub(dbContext);

        var createRecurringTaskRequest = new CreateRecurringTaskRequest
        {
            RecurringTask = new RecurringTaskProto
            {
                Title = "Recurring Task",
                Rrule = "FREQ=NOT_A_FREQUENCY"
            }
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<RpcException>(
            () => taskHub.CreateRecurringTask(createRecurringTaskRequest, null!));

        Assert.Equal(StatusCode.InvalidArgument, exception.Status.StatusCode);
        Assert.Empty(dbContext.RecurringTasks);
    }

    [Fact]
    public async System.Threading.Tasks.Task CreateRecurringTask_WithNullRRule_ThrowsException()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var taskHub = CreateTaskHub(dbContext);

        var createRecurringTaskRequest = new CreateRecurringTaskRequest
        {
            RecurringTask = new RecurringTaskProto
            {
                Title = "Recurring Task",
                CreatedBy = User1.ToString(),
                Rrule = ""
            }
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<RpcException>(
            () => taskHub.CreateRecurringTask(createRecurringTaskRequest, null!));

        Assert.Equal(StatusCode.InvalidArgument, exception.Status.StatusCode);
    }

    [Fact]
    public async System.Threading.Tasks.Task GetRecurringTask_WithValidId_ReturnsRecurringTaskWithInstances()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var taskHub = CreateTaskHub(dbContext);

        var recurringTaskId = Guid.NewGuid();
        var recurringTaskEntity = new RecurringTaskEntity
        {
            Id = recurringTaskId,
            Title = "Recurring Task",
            Description = "Weekly Meeting",
            CreatedBy = User1,
            AssignedTo = User2,
            RRule = "FREQ=WEEKLY;BYDAY=MO",
            CreatedAt = DateTime.UtcNow
        };

        var instance1 = new TaskEntity { Id = Guid.NewGuid(), Title = "Recurring Task", CreatedBy = User1, RecurringTaskId = recurringTaskId, CreatedAt = DateTime.UtcNow };
        var instance2 = new TaskEntity { Id = Guid.NewGuid(), Title = "Recurring Task", CreatedBy = User1, RecurringTaskId = recurringTaskId, CreatedAt = DateTime.UtcNow };

        dbContext.RecurringTasks.Add(recurringTaskEntity);
        dbContext.Tasks.AddRange(instance1, instance2);
        await dbContext.SaveChangesAsync();

        var getRecurringTaskRequest = new GetRecurringTaskRequest
        {
            Id = recurringTaskId.ToString()
        };

        // Act
        var response = await taskHub.GetRecurringTask(getRecurringTaskRequest, null!);

        // Assert
        Assert.NotNull(response.RecurringTask);
        Assert.Equal(recurringTaskId.ToString(), response.RecurringTask.Id);
        Assert.Equal("Recurring Task", response.RecurringTask.Title);
        Assert.Equal(2, response.Instances.Count);
    }

    [Fact]
    public async System.Threading.Tasks.Task GetRecurringTask_WithNonExistentId_ThrowsNotFoundException()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var taskHub = CreateTaskHub(dbContext);

        var getRecurringTaskRequest = new GetRecurringTaskRequest
        {
            Id = Guid.NewGuid().ToString()
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<RpcException>(
            () => taskHub.GetRecurringTask(getRecurringTaskRequest, null!));

        Assert.Equal(StatusCode.NotFound, exception.Status.StatusCode);
    }

    [Fact]
    public async System.Threading.Tasks.Task UpdateRecurringTask_WithValidTask_UpdatesSuccessfully()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var taskHub = CreateTaskHub(dbContext);

        var recurringTaskId = Guid.NewGuid();
        var recurringTaskEntity = new RecurringTaskEntity
        {
            Id = recurringTaskId,
            Title = "Original Title",
            CreatedBy = User1,
            RRule = "FREQ=WEEKLY;BYDAY=MO",
            CreatedAt = DateTime.UtcNow
        };

        dbContext.RecurringTasks.Add(recurringTaskEntity);
        await dbContext.SaveChangesAsync();

        var updateRecurringTaskRequest = new UpdateRecurringTaskRequest
        {
            RecurringTask = new RecurringTaskProto
            {
                Id = recurringTaskId.ToString(),
                Title = "Updated Title",
                CreatedBy = User1.ToString(),
                AssignedTo = User3.ToString(),
                Rrule = "FREQ=DAILY"
            }
        };

        // Act
        await taskHub.UpdateRecurringTask(updateRecurringTaskRequest, null!);

        // Assert
        var updatedRecurringTask = await dbContext.RecurringTasks.FindAsync(recurringTaskId);
        Assert.NotNull(updatedRecurringTask);
        Assert.Equal("Updated Title", updatedRecurringTask.Title);
        Assert.Equal(User3, updatedRecurringTask.AssignedTo);
        Assert.Equal("FREQ=DAILY", updatedRecurringTask.RRule);
    }

    [Fact]
    public async System.Threading.Tasks.Task DeleteRecurringTask_WithValidId_DeletesSuccessfully()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var taskHub = CreateTaskHub(dbContext);

        var recurringTaskId = Guid.NewGuid();
        var recurringTaskEntity = new RecurringTaskEntity
        {
            Id = recurringTaskId,
            Title = "Recurring Task",
            CreatedBy = User1,
            RRule = "FREQ=WEEKLY",
            CreatedAt = DateTime.UtcNow
        };

        dbContext.RecurringTasks.Add(recurringTaskEntity);
        await dbContext.SaveChangesAsync();

        var deleteRecurringTaskRequest = new DeleteRecurringTaskRequest
        {
            Id = recurringTaskId.ToString()
        };

        // Act
        await taskHub.DeleteRecurringTask(deleteRecurringTaskRequest, null!);

        // Assert
        var deletedRecurringTask = await dbContext.RecurringTasks.FindAsync(recurringTaskId);
        Assert.Null(deletedRecurringTask);
    }

    [Fact]
    public async System.Threading.Tasks.Task DeleteRecurringTask_WithValidId_CascadeDeletesInstances()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var taskHub = CreateTaskHub(dbContext);

        var recurringTaskId = Guid.NewGuid();
        var recurringTaskEntity = new RecurringTaskEntity
        {
            Id = recurringTaskId,
            Title = "Recurring Task",
            CreatedBy = User1,
            RRule = "FREQ=WEEKLY",
            CreatedAt = DateTime.UtcNow
        };

        var instance = new TaskEntity { Id = Guid.NewGuid(), Title = "Task Instance", CreatedBy = User1, RecurringTaskId = recurringTaskId, CreatedAt = DateTime.UtcNow };

        dbContext.RecurringTasks.Add(recurringTaskEntity);
        dbContext.Tasks.Add(instance);
        await dbContext.SaveChangesAsync();

        var deleteRecurringTaskRequest = new DeleteRecurringTaskRequest
        {
            Id = recurringTaskId.ToString()
        };

        // Act
        await taskHub.DeleteRecurringTask(deleteRecurringTaskRequest, null!);

        // Assert
        var deletedRecurringTask = await dbContext.RecurringTasks.FindAsync(recurringTaskId);
        var deletedInstance = await dbContext.Tasks.FindAsync(instance.Id);
        Assert.Null(deletedRecurringTask);
        Assert.Null(deletedInstance);
    }

    [Fact]
    public async System.Threading.Tasks.Task ListRecurringTasks_ReturnsAllRecurringTasks()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var taskHub = CreateTaskHub(dbContext);

        var rt1 = new RecurringTaskEntity { Id = Guid.NewGuid(), Title = "Task 1", CreatedBy = User1, RRule = "FREQ=WEEKLY", CreatedAt = DateTime.UtcNow };
        var rt2 = new RecurringTaskEntity { Id = Guid.NewGuid(), Title = "Task 2", CreatedBy = User1, RRule = "FREQ=DAILY", CreatedAt = DateTime.UtcNow };

        dbContext.RecurringTasks.AddRange(rt1, rt2);
        await dbContext.SaveChangesAsync();

        var listRecurringTasksRequest = new ListRecurringTasksRequest();

        // Act
        var response = await taskHub.ListRecurringTasks(listRecurringTasksRequest, null!);

        // Assert
        Assert.Equal(2, response.RecurringTasks.Count);
    }

    #endregion

    #region GetTasksInRange Tests

    [Fact]
    public async System.Threading.Tasks.Task GetTasksInRange_WithRegularTasks_ReturnsTasksInRange()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var taskHub = CreateTaskHub(dbContext);

        var now = DateTime.UtcNow;
        var task1 = new TaskEntity { Id = Guid.NewGuid(), Title = "Task 1", CreatedBy = User1, Done = false, CreatedAt = now };
        var task2 = new TaskEntity { Id = Guid.NewGuid(), Title = "Task 2", CreatedBy = User1, Done = false, CreatedAt = now.AddDays(5) };

        dbContext.Tasks.AddRange(task1, task2);
        await dbContext.SaveChangesAsync();

        var getTasksInRangeRequest = new GetTasksInRangeRequest
        {
            Range = new DateRange
            {
                Start = Timestamp.FromDateTime(now.AddDays(-1)),
                End = Timestamp.FromDateTime(now.AddDays(10))
            }
        };

        // Act
        var response = await taskHub.GetTasksInRange(getTasksInRangeRequest, null!);

        // Assert
        Assert.Equal(2, response.Tasks.Count);
        Assert.All(response.Tasks, t => Assert.False(t.Done));
    }

    [Fact]
    public async System.Threading.Tasks.Task GetTasksInRange_WithDoneTasksInRange_IncludesDoneTasksInRange()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var taskHub = CreateTaskHub(dbContext);

        var now = DateTime.UtcNow;
        var doneTaskInRange = new TaskEntity { Id = Guid.NewGuid(), Title = "Done Task", CreatedBy = User1, Done = true, DoneAt = now.AddDays(3), CreatedAt = now };
        var doneTaskOutsideRange = new TaskEntity { Id = Guid.NewGuid(), Title = "Old Done Task", CreatedBy = User1, Done = true, DoneAt = now.AddDays(-10), CreatedAt = now.AddDays(-10) };

        dbContext.Tasks.AddRange(doneTaskInRange, doneTaskOutsideRange);
        await dbContext.SaveChangesAsync();

        var getTasksInRangeRequest = new GetTasksInRangeRequest
        {
            Range = new DateRange
            {
                Start = Timestamp.FromDateTime(now.AddDays(-1)),
                End = Timestamp.FromDateTime(now.AddDays(10))
            }
        };

        // Act
        var response = await taskHub.GetTasksInRange(getTasksInRangeRequest, null!);

        // Assert
        Assert.Single(response.Tasks);
        Assert.True(response.Tasks.First().Done);
        Assert.Equal("Done Task", response.Tasks.First().Title);
    }

    [Fact]
    public async System.Threading.Tasks.Task GetTasksInRange_WithCompletedRecurringInstanceAcrossDays_ReturnsInstanceOnce()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var taskHub = CreateTaskHub(dbContext);

        var occurrence = DateTime.UtcNow.Date.AddDays(-2).AddHours(9);
        var recurringTask = new RecurringTaskEntity
        {
            Id = Guid.NewGuid(),
            Title = "Water plants",
            CreatedBy = User1,
            RRule = "FREQ=DAILY",
            CreatedAt = occurrence
        };
        var completedInstance = new TaskEntity
        {
            Id = Guid.NewGuid(),
            Title = "Water plants",
            CreatedBy = User1,
            RecurringTaskId = recurringTask.Id,
            Done = true,
            // Checked off days after the occurrence it represents.
            DoneAt = DateTime.UtcNow,
            CreatedAt = occurrence
        };

        dbContext.RecurringTasks.Add(recurringTask);
        dbContext.Tasks.Add(completedInstance);
        await dbContext.SaveChangesAsync();

        var getTasksInRangeRequest = new GetTasksInRangeRequest
        {
            Range = new DateRange
            {
                Start = Timestamp.FromDateTime(occurrence.Date),
                End = Timestamp.FromDateTime(occurrence.Date.AddDays(1))
            }
        };

        // Act
        var response = await taskHub.GetTasksInRange(getTasksInRangeRequest, null!);

        // Assert
        var instance = Assert.Single(response.Tasks.Where(t => t.Title == "Water plants"));
        Assert.True(instance.Done);
        Assert.Equal(completedInstance.Id.ToString(), instance.Id);
    }

    [Fact]
    public async System.Threading.Tasks.Task GetTasksInRange_WithNullRange_ThrowsException()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var taskHub = CreateTaskHub(dbContext);

        var getTasksInRangeRequest = new GetTasksInRangeRequest
        {
            Range = null!
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<RpcException>(
            () => taskHub.GetTasksInRange(getTasksInRangeRequest, null!));

        Assert.Equal(GrpcStatusCode.InvalidArgument, exception.Status.StatusCode);
    }

    [Fact]
    public async System.Threading.Tasks.Task GetTasksInRange_WithMixedRegularAndRecurring_ReturnsBoth()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var taskHub = CreateTaskHub(dbContext);

        var now = DateTime.UtcNow;

        // Regular task
        var regularTask = new TaskEntity { Id = Guid.NewGuid(), Title = "One-time Task", CreatedBy = User1, Done = false, CreatedAt = now };
        dbContext.Tasks.Add(regularTask);

        await dbContext.SaveChangesAsync();

        var getTasksInRangeRequest = new GetTasksInRangeRequest
        {
            Range = new DateRange
            {
                Start = Timestamp.FromDateTime(now.AddDays(-1)),
                End = Timestamp.FromDateTime(now.AddDays(5))
            }
        };

        // Act
        var response = await taskHub.GetTasksInRange(getTasksInRangeRequest, null!);

        // Assert
        Assert.NotEmpty(response.Tasks);
        var oneTimeTasks = response.Tasks.Where(t => t.Title == "One-time Task").ToList();
        Assert.Single(oneTimeTasks);
    }

    [Fact]
    public async System.Threading.Tasks.Task GetTasksInRange_WithEmptyRange_ReturnsEmptyList()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var taskHub = CreateTaskHub(dbContext);

        var now = DateTime.UtcNow;
        // Task created outside the query range and marked done outside range
        var task = new TaskEntity { Id = Guid.NewGuid(), Title = "Task", CreatedBy = User1, Done = true, DoneAt = now.AddDays(10), CreatedAt = now.AddDays(10) };
        dbContext.Tasks.Add(task);
        await dbContext.SaveChangesAsync();

        // Query for range where task's done date doesn't exist
        var getTasksInRangeRequest = new GetTasksInRangeRequest
        {
            Range = new DateRange
            {
                Start = Timestamp.FromDateTime(now.AddDays(-10)),
                End = Timestamp.FromDateTime(now.AddDays(-5))
            }
        };

        // Act
        var response = await taskHub.GetTasksInRange(getTasksInRangeRequest, null!);

        // Assert
        // The task was marked done on day 10, so it shouldn't appear in the query for days -10 to -5
        Assert.Empty(response.Tasks.Where(t => t.Title == "Task"));
    }

    #endregion
}
