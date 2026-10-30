using Microsoft.EntityFrameworkCore;
using EventEntity = HomeHub.Events.Entities.Event;

namespace HomeHub.Events.Contexts;

public interface IEventDbContext
{
    DbSet<EventEntity> Events { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
