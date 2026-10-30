using Microsoft.EntityFrameworkCore;
using UserEntity = HomeHub.Users.Entities.User;

namespace HomeHub.Users.Contexts;

public interface IUserDbContext
{
    DbSet<UserEntity> Users { get; set; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
