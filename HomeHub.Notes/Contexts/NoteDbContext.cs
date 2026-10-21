using HomeHub.Notes.Entities;
using Microsoft.EntityFrameworkCore;

namespace HomeHub.Notes.Contexts;

public class NoteDbContext : DbContext
{
    public NoteDbContext(DbContextOptions<NoteDbContext> options)
        : base(options)
    {
    }

    public DbSet<Entities.Note> Notes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Note entity
        modelBuilder.Entity<Entities.Note>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Content).IsRequired().HasMaxLength(5000);
            entity.Property(e => e.CreatedBy).IsRequired().HasMaxLength(255);
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt).IsRequired(false);
        });
    }
}
