using HomeHub.Events.Contexts;
using HomeHub.Lists.Contexts;
using HomeHub.Notes.Contexts;
using HomeHub.Users.Contexts;
using HumeHub.Tasks.Contexts;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using EventEntity = HomeHub.Events.Entities.Event;
using ListEntity = HomeHub.Lists.Entities.List;
using NoteEntity = HomeHub.Notes.Entities.Note;
using RecurringTaskEntity = HumeHub.Tasks.Entities.RecurringTask;
using TaskEntity = HumeHub.Tasks.Entities.Task;
using UserEntity = HomeHub.Users.Entities.User;

namespace HomeHub.Hub.Contexts;

public class HubDbContext : DbContext, IEventDbContext, ITaskDbContext, INoteDbContext, IListDbContext, IUserDbContext
{
    public HubDbContext(DbContextOptions<HubDbContext> options)
        : base(options)
    {
    }

    public DbSet<EventEntity> Events { get; set; } = null!;

    public DbSet<TaskEntity> Tasks { get; set; } = null!;

    public DbSet<RecurringTaskEntity> RecurringTasks { get; set; } = null!;

    public DbSet<NoteEntity> Notes { get; set; } = null!;

    public DbSet<ListEntity> Lists { get; set; } = null!;

    public DbSet<UserEntity> Users { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<EventEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Organizer).IsRequired();
            entity.Property(e => e.Category).IsRequired().HasMaxLength(100);
            entity.Property(e => e.AllDay).IsRequired();
            entity.Property(e => e.Start).IsRequired();
        });

        modelBuilder.Entity<RecurringTaskEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.CreatedBy).IsRequired();
            entity.Property(e => e.AssignedTo);
            entity.Property(e => e.RRule).IsRequired().HasMaxLength(500);
            entity.Property(e => e.CreatedAt).IsRequired();

            entity.HasMany(e => e.Instances)
                .WithOne(t => t.RecurringTask)
                .HasForeignKey(t => t.RecurringTaskId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TaskEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.CreatedBy).IsRequired();
            entity.Property(e => e.AssignedTo);
            entity.Property(e => e.Done).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.RecurringTaskId).IsRequired(false);
        });

        modelBuilder.Entity<NoteEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Content).IsRequired().HasMaxLength(5000);
            entity.Property(e => e.CreatedBy).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt).IsRequired(false);
        });

        modelBuilder.Entity<ListEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Content).IsRequired();
            entity.Property(e => e.CreatedBy).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt).IsRequired(false);
        });

        modelBuilder.Entity<UserEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FullName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.HashedApiKey).IsRequired().HasMaxLength(128);
            entity.Property(e => e.Type).IsRequired();
            entity.HasIndex(e => e.HashedApiKey).IsUnique();
        });

        // SQLite stores DateTime as TEXT and loses DateTimeKind; restore UTC on read so
        // Timestamp.FromDateTime (protobuf) accepts values loaded from the database.
        var dateTimeConverter = new ValueConverter<DateTime, DateTime>(
            v => v,
            v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        var nullableDateTimeConverter = new ValueConverter<DateTime?, DateTime?>(
            v => v,
            v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v);

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(DateTime))
                {
                    property.SetValueConverter(dateTimeConverter);
                }
                else if (property.ClrType == typeof(DateTime?))
                {
                    property.SetValueConverter(nullableDateTimeConverter);
                }
            }
        }
    }
}
