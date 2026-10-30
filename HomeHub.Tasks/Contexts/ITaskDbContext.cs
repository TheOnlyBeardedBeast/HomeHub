using Microsoft.EntityFrameworkCore;
using RecurringTaskEntity = HumeHub.Tasks.Entities.RecurringTask;
using TaskEntity = HumeHub.Tasks.Entities.Task;

namespace HumeHub.Tasks.Contexts;

public interface ITaskDbContext
{
    DbSet<TaskEntity> Tasks { get; }

    DbSet<RecurringTaskEntity> RecurringTasks { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
