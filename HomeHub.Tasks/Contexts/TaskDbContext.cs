using HumeHub.Tasks.Entities;
using Microsoft.EntityFrameworkCore;

namespace HumeHub.Tasks.Contexts;

public class TaskDbContext : DbContext
{
    public TaskDbContext(DbContextOptions<TaskDbContext> options)
        : base(options)
    {
    }

    public DbSet<Entities.Task> Tasks { get; set; }
    public DbSet<Entities.RecurringTask> RecurringTasks { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure RecurringTask entity
        modelBuilder.Entity<Entities.RecurringTask>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.CreatedBy).IsRequired().HasMaxLength(255);
            entity.Property(e => e.AssignedTo).HasMaxLength(255);
            entity.Property(e => e.RRule).IsRequired().HasMaxLength(500);
            entity.Property(e => e.CreatedAt).IsRequired();

            // One-to-many relationship
            entity.HasMany(e => e.Instances)
                .WithOne(t => t.RecurringTask)
                .HasForeignKey(t => t.RecurringTaskId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure Task entity
        modelBuilder.Entity<Entities.Task>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.CreatedBy).IsRequired().HasMaxLength(255);
            entity.Property(e => e.AssignedTo).HasMaxLength(255);
            entity.Property(e => e.Done).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.RecurringTaskId).IsRequired(false);
        });
    }
}
