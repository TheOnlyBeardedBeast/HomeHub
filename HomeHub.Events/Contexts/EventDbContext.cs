using Microsoft.EntityFrameworkCore;
using HomeHub.Events.Entities;

namespace HomeHub.Events.Contexts;

public class EventDbContext : DbContext
{
    public EventDbContext(DbContextOptions<EventDbContext> options)
        : base(options)
    {
    }

    public DbSet<Entities.Event> Events { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Event entity
        modelBuilder.Entity<Entities.Event>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Organizer).IsRequired();
            entity.Property(e => e.Category).IsRequired().HasMaxLength(100);
            entity.Property(e => e.AllDay).IsRequired();

            // Configure JSONB columns for PostgreSQL
            entity.Property(e => e.Rrules).HasColumnType("jsonb");
            entity.Property(e => e.ExceptDates).HasColumnType("jsonb");
        });
    }
}