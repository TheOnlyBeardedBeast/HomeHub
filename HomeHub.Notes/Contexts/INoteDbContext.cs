using Microsoft.EntityFrameworkCore;
using NoteEntity = HomeHub.Notes.Entities.Note;

namespace HomeHub.Notes.Contexts;

public interface INoteDbContext
{
    DbSet<NoteEntity> Notes { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
