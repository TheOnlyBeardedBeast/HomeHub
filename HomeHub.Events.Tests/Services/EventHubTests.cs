using Google.Protobuf.WellKnownTypes;
using Grpc.Core;
using HomeHub.Hub.Contexts;
using HomeHub.Events.Services;
using HomeHub.Users.Security;
using Microsoft.EntityFrameworkCore;
using Xunit;
using EventEntity = HomeHub.Events.Entities.Event;
using EventProto = HomeHub.Events.Event;

namespace HomeHub.Events.Tests.Services;

public class EventHubTests
{
    private static readonly Guid UserId = Guid.Parse("33333333-3333-3333-3333-333333333333");

    private HubDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<HubDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new HubDbContext(options);
    }

    private static EventHub CreateEventHub(HubDbContext dbContext) =>
        new(dbContext, new CurrentUser { UserId = UserId, FullName = "Test User" });

    [Fact]
    public async Task CreateEvent_WithValidEvent_CreatesEventSuccessfully()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var eventHub = CreateEventHub(dbContext);

        var organizerId = Guid.NewGuid();
        var startTime = DateTime.UtcNow.AddDays(1);
        var endTime = startTime.AddHours(2);

        var createEventRequest = new CreateEventRequest
        {
            Event = new EventProto
            {
                Title = "Test Event",
                Description = "Test Description",
                Organizer = organizerId.ToString(),
                Start = Timestamp.FromDateTime(startTime),
                End = Timestamp.FromDateTime(endTime),
                Category = "Meeting",
                AllDay = false
            }
        };

        // Act
        var response = await eventHub.CreateEvent(createEventRequest, null!);

        // Assert
        Assert.NotEmpty(response.Id);
        Assert.True(Guid.TryParse(response.Id, out _));

        // Verify event was saved to database
        var savedEvent = await dbContext.Events.FirstOrDefaultAsync(e => e.Id.ToString() == response.Id);
        Assert.NotNull(savedEvent);
        Assert.Equal("Test Event", savedEvent.Title);
        Assert.Equal("Test Description", savedEvent.Description);
        Assert.Equal(UserId, savedEvent.Organizer);
    }

    [Fact]
    public async Task CreateEvent_WithNullEvent_ThrowsException()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var eventHub = CreateEventHub(dbContext);

        var createEventRequest = new CreateEventRequest
        {
            Event = null!
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<RpcException>(
            () => eventHub.CreateEvent(createEventRequest, null!));

        Assert.Equal(StatusCode.InvalidArgument, exception.Status.StatusCode);
    }

    [Fact]
    public async Task GetEvent_WithValidId_ReturnsEvent()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var eventHub = CreateEventHub(dbContext);

        var eventId = Guid.NewGuid();
        var organizerId = Guid.NewGuid();
        var startTime = DateTime.UtcNow.AddDays(1);
        var endTime = startTime.AddHours(2);

        var eventEntity = new EventEntity
        {
            Id = eventId,
            Title = "Test Event",
            Description = "Test Description",
            Organizer = organizerId,
            Start = startTime,
            End = endTime,
            Category = "Meeting",
            AllDay = false
        };

        dbContext.Events.Add(eventEntity);
        await dbContext.SaveChangesAsync();

        var getEventRequest = new GetEventRequest
        {
            Id = eventId.ToString()
        };

        // Act
        var response = await eventHub.GetEvent(getEventRequest, null!);

        // Assert
        Assert.NotNull(response.Event);
        Assert.Equal(eventId.ToString(), response.Event.Id);
        Assert.Equal("Test Event", response.Event.Title);
        Assert.Equal("Test Description", response.Event.Description);
        Assert.Equal(organizerId.ToString(), response.Event.Organizer);
    }

    [Fact]
    public async Task GetEvent_WithInvalidId_ThrowsException()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var eventHub = CreateEventHub(dbContext);

        var getEventRequest = new GetEventRequest
        {
            Id = "invalid-guid"
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<RpcException>(
            () => eventHub.GetEvent(getEventRequest, null!));

        Assert.Equal(StatusCode.InvalidArgument, exception.Status.StatusCode);
    }

    [Fact]
    public async Task GetEvent_WithNonExistentId_ThrowsNotFoundException()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var eventHub = CreateEventHub(dbContext);

        var nonExistentId = Guid.NewGuid().ToString();

        var getEventRequest = new GetEventRequest
        {
            Id = nonExistentId
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<RpcException>(
            () => eventHub.GetEvent(getEventRequest, null!));

        Assert.Equal(StatusCode.NotFound, exception.Status.StatusCode);
    }

    [Fact]
    public async Task RemoveEvent_WithValidId_RemovesEventSuccessfully()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var eventHub = CreateEventHub(dbContext);

        var eventId = Guid.NewGuid();
        var eventEntity = new EventEntity
        {
            Id = eventId,
            Title = "Test Event",
            Organizer = Guid.NewGuid(),
            Category = "Meeting"
        };

        dbContext.Events.Add(eventEntity);
        await dbContext.SaveChangesAsync();

        var removeEventRequest = new RemoveEventRequest
        {
            Id = eventId.ToString()
        };

        // Act
        await eventHub.RemoveEvent(removeEventRequest, null!);

        // Assert
        var removedEvent = await dbContext.Events.FindAsync(eventId);
        Assert.Null(removedEvent);
    }

    [Fact]
    public async Task RemoveEvent_WithNonExistentId_ThrowsNotFoundException()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var eventHub = CreateEventHub(dbContext);

        var removeEventRequest = new RemoveEventRequest
        {
            Id = Guid.NewGuid().ToString()
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<RpcException>(
            () => eventHub.RemoveEvent(removeEventRequest, null!));

        Assert.Equal(StatusCode.NotFound, exception.Status.StatusCode);
    }

    [Fact]
    public async Task UpdateEvent_WithValidEvent_UpdatesSuccessfully()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var eventHub = CreateEventHub(dbContext);

        var eventId = Guid.NewGuid();
        var organizerId = Guid.NewGuid();
        var newOrganizerId = Guid.NewGuid();

        var eventEntity = new EventEntity
        {
            Id = eventId,
            Title = "Original Title",
            Description = "Original Description",
            Organizer = organizerId,
            Category = "Meeting",
            AllDay = false
        };

        dbContext.Events.Add(eventEntity);
        await dbContext.SaveChangesAsync();

        var startTime = DateTime.UtcNow.AddDays(1);
        var endTime = startTime.AddHours(2);

        var updateEventRequest = new UpdateEventRequest
        {
            Event = new EventProto
            {
                Id = eventId.ToString(),
                Title = "Updated Title",
                Description = "Updated Description",
                Organizer = newOrganizerId.ToString(),
                Start = Timestamp.FromDateTime(startTime),
                End = Timestamp.FromDateTime(endTime),
                Category = "Workshop",
                AllDay = true
            }
        };

        // Act
        await eventHub.UpdateEvent(updateEventRequest, null!);

        // Assert
        var updatedEvent = await dbContext.Events.FindAsync(eventId);
        Assert.NotNull(updatedEvent);
        Assert.Equal("Updated Title", updatedEvent.Title);
        Assert.Equal("Updated Description", updatedEvent.Description);
        Assert.Equal(organizerId, updatedEvent.Organizer);
        Assert.Equal("Workshop", updatedEvent.Category);
        Assert.True(updatedEvent.AllDay);
    }

    [Fact]
    public async Task UpdateEvent_WithNonExistentId_ThrowsNotFoundException()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var eventHub = CreateEventHub(dbContext);

        var updateEventRequest = new UpdateEventRequest
        {
            Event = new EventProto
            {
                Id = Guid.NewGuid().ToString(),
                Title = "Updated Title",
                Organizer = Guid.NewGuid().ToString(),
                Category = "Meeting"
            }
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<RpcException>(
            () => eventHub.UpdateEvent(updateEventRequest, null!));

        Assert.Equal(StatusCode.NotFound, exception.Status.StatusCode);
    }

    [Fact]
    public async Task RemoveOccurrence_WithValidEventAndDate_AddsExceptionDate()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var eventHub = CreateEventHub(dbContext);

        var eventId = Guid.NewGuid();
        var occurrenceDate = DateTime.UtcNow.AddDays(1);

        var eventEntity = new EventEntity
        {
            Id = eventId,
            Title = "Recurring Event",
            Organizer = Guid.NewGuid(),
            Category = "Meeting",
            Rrules = new[] { "FREQ=WEEKLY;COUNT=10" }
        };

        dbContext.Events.Add(eventEntity);
        await dbContext.SaveChangesAsync();

        var removeOccurrenceRequest = new RemoveOccurrenceRequest
        {
            EventId = eventId.ToString(),
            OccurrenceDate = Timestamp.FromDateTime(occurrenceDate)
        };

        // Act
        await eventHub.RemoveOccurrence(removeOccurrenceRequest, null!);

        // Assert
        var updatedEvent = await dbContext.Events.FindAsync(eventId);
        Assert.NotNull(updatedEvent);
        Assert.NotNull(updatedEvent.ExceptDates);
        Assert.Single(updatedEvent.ExceptDates);
        Assert.Contains(occurrenceDate, updatedEvent.ExceptDates);
    }

    [Fact]
    public async Task RemoveOccurrence_WithDuplicateDate_OnlyAddsOnce()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var eventHub = CreateEventHub(dbContext);

        var eventId = Guid.NewGuid();
        var occurrenceDate = DateTime.UtcNow.AddDays(1);

        var eventEntity = new EventEntity
        {
            Id = eventId,
            Title = "Recurring Event",
            Organizer = Guid.NewGuid(),
            Category = "Meeting",
            Rrules = new[] { "FREQ=WEEKLY;COUNT=10" },
            ExceptDates = new[] { occurrenceDate }
        };

        dbContext.Events.Add(eventEntity);
        await dbContext.SaveChangesAsync();

        var removeOccurrenceRequest = new RemoveOccurrenceRequest
        {
            EventId = eventId.ToString(),
            OccurrenceDate = Timestamp.FromDateTime(occurrenceDate)
        };

        // Act
        await eventHub.RemoveOccurrence(removeOccurrenceRequest, null!);

        // Assert
        var updatedEvent = await dbContext.Events.FindAsync(eventId);
        Assert.NotNull(updatedEvent);
        Assert.NotNull(updatedEvent.ExceptDates);
        Assert.Single(updatedEvent.ExceptDates);
    }

    [Fact]
    public async Task GetEvents_WithEventsInDateRange_ReturnsEventsInRange()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var eventHub = CreateEventHub(dbContext);

        var now = DateTime.UtcNow;
        var rangeStart = now.AddDays(1);
        var rangeEnd = now.AddDays(8);

        // Add event within range
        var eventInRange = new EventEntity
        {
            Id = Guid.NewGuid(),
            Title = "Event In Range",
            Organizer = Guid.NewGuid(),
            Start = rangeStart.AddHours(1),
            End = rangeStart.AddHours(3),
            Category = "Meeting",
            AllDay = false
        };

        // Add event outside range
        var eventOutsideRange = new EventEntity
        {
            Id = Guid.NewGuid(),
            Title = "Event Outside Range",
            Organizer = Guid.NewGuid(),
            Start = rangeEnd.AddDays(5),
            End = rangeEnd.AddDays(5).AddHours(2),
            Category = "Meeting",
            AllDay = false
        };

        dbContext.Events.Add(eventInRange);
        dbContext.Events.Add(eventOutsideRange);
        await dbContext.SaveChangesAsync();

        var getEventsRequest = new GetEventsRequest
        {
            Range = new DateRange
            {
                Start = Timestamp.FromDateTime(rangeStart),
                End = Timestamp.FromDateTime(rangeEnd)
            }
        };

        // Act
        var response = await eventHub.GetEvents(getEventsRequest, null!);

        // Assert
        Assert.Single(response.Events);
        Assert.Equal("Event In Range", response.Events[0].Title);
    }

    [Fact]
    public async Task GetEvents_WithNullRange_ThrowsException()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var eventHub = CreateEventHub(dbContext);

        var getEventsRequest = new GetEventsRequest
        {
            Range = null!
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<RpcException>(
            () => eventHub.GetEvents(getEventsRequest, null!));

        Assert.Equal(StatusCode.InvalidArgument, exception.Status.StatusCode);
    }

    [Fact]
    public async Task GetEvents_WithRecurringEvent_ReturnsMultipleOccurrences()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var eventHub = CreateEventHub(dbContext);

        // Create a start date that's a Monday
        var now = DateTime.UtcNow;
        var monday = now.AddDays((int)DayOfWeek.Monday - (int)now.DayOfWeek);
        if (monday < now)
        {
            monday = monday.AddDays(7);
        }

        var eventStart = monday.Date.AddHours(10);
        var eventEnd = eventStart.AddHours(1);

        // Create a recurring event for Mon, Wed, Fri
        var recurringEvent = new EventEntity
        {
            Id = Guid.NewGuid(),
            Title = "Weekly Standup",
            Organizer = Guid.NewGuid(),
            Start = eventStart,
            End = eventEnd,
            Category = "Meeting",
            AllDay = false,
            Rrules = new[] { "FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=10" }
        };

        dbContext.Events.Add(recurringEvent);
        await dbContext.SaveChangesAsync();

        // Query for the entire week starting from Monday
        var rangeStart = monday.Date;
        var rangeEnd = monday.Date.AddDays(7);

        var getEventsRequest = new GetEventsRequest
        {
            Range = new DateRange
            {
                Start = Timestamp.FromDateTime(rangeStart),
                End = Timestamp.FromDateTime(rangeEnd)
            }
        };

        // Act
        var response = await eventHub.GetEvents(getEventsRequest, null!);

        // Assert - Should have 3 occurrences (Monday, Wednesday, Friday)
        Assert.Equal(3, response.Events.Count);
        Assert.All(response.Events, e => Assert.Equal("Weekly Standup", e.Title));

        // Verify the days are correct (Monday, Wednesday, Friday)
        var eventDates = response.Events.Select(e => e.Start!.ToDateTime().DayOfWeek).ToList();
        Assert.Contains(DayOfWeek.Monday, eventDates);
        Assert.Contains(DayOfWeek.Wednesday, eventDates);
        Assert.Contains(DayOfWeek.Friday, eventDates);
    }

    [Fact]
    public async Task GetEvents_WithRecurringEventStartedBeforeRange_ReturnsOccurrences()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var eventHub = CreateEventHub(dbContext);

        var now = DateTime.UtcNow;
        var firstOccurrence = now.Date.AddDays(-14).AddHours(10);

        var recurringEvent = new EventEntity
        {
            Id = Guid.NewGuid(),
            Title = "Weekly Dinner",
            Organizer = Guid.NewGuid(),
            Start = firstOccurrence,
            End = firstOccurrence.AddHours(1),
            Rrules = new[] { "FREQ=WEEKLY" },
            Category = "Family",
            AllDay = false
        };

        dbContext.Events.Add(recurringEvent);
        await dbContext.SaveChangesAsync();

        var getEventsRequest = new GetEventsRequest
        {
            Range = new DateRange
            {
                Start = Timestamp.FromDateTime(now.Date),
                End = Timestamp.FromDateTime(now.Date.AddDays(7))
            }
        };

        // Act
        var response = await eventHub.GetEvents(getEventsRequest, null!);

        // Assert
        Assert.Contains(response.Events, e => e.Title == "Weekly Dinner");
    }

    [Fact]
    public async Task CreateEvent_WithMissingStart_ThrowsInvalidArgument()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var eventHub = CreateEventHub(dbContext);

        var request = new CreateEventRequest
        {
            Event = new EventProto
            {
                Title = "No Start",
                Category = "Family"
            }
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<RpcException>(
            () => eventHub.CreateEvent(request, null!));

        Assert.Equal(StatusCode.InvalidArgument, exception.Status.StatusCode);
    }

    [Fact]
    public async Task CreateEvent_WithInvalidRRule_ThrowsInvalidArgument()
    {
        // Arrange
        var dbContext = CreateInMemoryDbContext();
        var eventHub = CreateEventHub(dbContext);

        var request = new CreateEventRequest
        {
            Event = new EventProto
            {
                Title = "Bad Recurrence",
                Category = "Family",
                Start = Timestamp.FromDateTime(DateTime.UtcNow.AddDays(1))
            }
        };
        request.Event.Rrules.Add("FREQ=NOT_A_FREQUENCY");

        // Act & Assert
        var exception = await Assert.ThrowsAsync<RpcException>(
            () => eventHub.CreateEvent(request, null!));

        Assert.Equal(StatusCode.InvalidArgument, exception.Status.StatusCode);
        Assert.Empty(dbContext.Events);
    }
}
