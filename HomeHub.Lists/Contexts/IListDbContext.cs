using Microsoft.EntityFrameworkCore;
using ListEntity = HomeHub.Lists.Entities.List;

namespace HomeHub.Lists.Contexts;

public interface IListDbContext
{
    DbSet<ListEntity> Lists { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
