using Google.Protobuf.WellKnownTypes;
using Grpc.Core;
using HomeHub.Events.Contexts;
using HomeHub.Events.Mappers;
using Ical.Net;
using Ical.Net.DataTypes;
using Microsoft.EntityFrameworkCore;

namespace HomeHub.Events.Services;

public class EventHub : EventService.EventServiceBase
{
    private readonly EventDbContext _dbContext;

    public EventHub(EventDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public override async Task<CreateEventResponse> CreateEvent(CreateEventRequest request, ServerCallContext context)
    {
        if (request.Event == null)
        {
            throw new RpcException(new Status(Grpc.Core.StatusCode.InvalidArgument, "Event cannot be null"));
        }

        var eventEntity = new Entities.Event
        {
            Id = Guid.NewGuid(),
            Title = request.Event.Title,
            Description = request.Event.Description,
            Organizer = Guid.Parse(request.Event.Organizer),
            Start = request.Event.Start?.ToDateTime(),
            End = request.Event.End?.ToDateTime(),
            Rrules = request.Event.Rrules?.ToList().ToArray(),
            Category = request.Event.Category,
            AllDay = request.Event.AllDay,
            ExceptDates = request.Event.ExceptDates?.Select(ts => ts.ToDateTime()).ToArray()
        };

        _dbContext.Events.Add(eventEntity);
        await _dbContext.SaveChangesAsync();

        return new CreateEventResponse
        {
            Id = eventEntity.Id.ToString()
        };
    }

    public override async Task<GetEventResponse> GetEvent(GetEventRequest request, ServerCallContext context)
    {
        if (string.IsNullOrEmpty(request.Id))
        {
            throw new RpcException(new Status(Grpc.Core.StatusCode.InvalidArgument, "Event ID cannot be null or empty"));
        }

        if (!Guid.TryParse(request.Id, out var eventId))
        {
            throw new RpcException(new Status(Grpc.Core.StatusCode.InvalidArgument, "Event ID must be a valid GUID"));
        }

        var eventEntity = await _dbContext.Events.FindAsync(eventId);
        if (eventEntity == null)
        {
            throw new RpcException(new Status(Grpc.Core.StatusCode.NotFound, $"Event with ID {eventId} not found"));
        }

        var protoEvent = new Event
        {
            Id = eventEntity.Id.ToString(),
            Title = eventEntity.Title,
            Description = eventEntity.Description ?? string.Empty,
            Organizer = eventEntity.Organizer.ToString(),
            Start = eventEntity.Start.HasValue ? Timestamp.FromDateTime(eventEntity.Start.Value) : null,
            End = eventEntity.End.HasValue ? Timestamp.FromDateTime(eventEntity.End.Value) : null,
            Category = eventEntity.Category,
            AllDay = eventEntity.AllDay
        };

        if (eventEntity.Rrules != null && eventEntity.Rrules.Length > 0)
        {
            protoEvent.Rrules.AddRange(eventEntity.Rrules);
        }

        if (eventEntity.ExceptDates != null && eventEntity.ExceptDates.Length > 0)
        {
            protoEvent.ExceptDates.AddRange(eventEntity.ExceptDates.Select(dt => Timestamp.FromDateTime(dt)));
        }

        return new GetEventResponse
        {
            Event = protoEvent
        };
    }

    public override async Task<GetEventsResponse> GetEvents(GetEventsRequest request, ServerCallContext context)
    {
        if (request.Range == null)
        {
            throw new RpcException(new Status(Grpc.Core.StatusCode.InvalidArgument, "Date range cannot be null"));
        }

        var rangeStart = request.Range.Start.ToDateTime();
        var rangeEnd = request.Range.End.ToDateTime();

        // Load recurring events that could have occurrences in range
        var recurringEvents = await _dbContext.Events
            .Where(e => e.Rrules != null && e.Rrules.Length > 0 &&
                        (e.End == null || e.End >= rangeStart) &&
                        (!e.Start.HasValue || e.Start <= rangeEnd))
            .ToListAsync();

        // Load non-recurring events within the specified range
        var nonRecurringEvents = await _dbContext.Events
            .Where(e => (e.Rrules == null || e.Rrules.Length == 0) &&
                        e.Start.HasValue &&
                        e.Start <= rangeEnd &&
                        (!e.End.HasValue || e.End >= rangeStart))
            .ToListAsync();

        var allEvents = recurringEvents.Concat(nonRecurringEvents).ToList();

        var response = new GetEventsResponse();
        var occurrences = new List<(Entities.Event Entity, DateTime OccurrenceStart, DateTime? OccurrenceEnd)>();

        foreach (var evt in allEvents)
        {
            var calEvent = evt.ToCalendarEvent();

            if (calEvent.RecurrenceRules.Count > 0)
            {
                // Recurring event - get occurrences in range
                var eventOccurrences = calEvent.GetOccurrences(new CalDateTime(rangeStart)).TakeWhileBefore(new CalDateTime(rangeEnd));

                foreach (var occurrence in eventOccurrences)
                {
                    var occStart = occurrence.Period.StartTime.AsUtc;
                    var occEnd = occurrence.Period.EndTime?.AsUtc;
                    occurrences.Add((evt, occStart, occEnd));
                }
            }
            else if (evt.Start.HasValue && evt.Start >= rangeStart && evt.Start <= rangeEnd)
            {
                // Non-recurring event in range
                occurrences.Add((evt, evt.Start.Value, evt.End));
            }
        }

        // Map to SimplifiedEvent using occurrence times
        foreach (var (entity, occStart, occEnd) in occurrences.OrderBy(o => o.OccurrenceStart))
        {
            response.Events.Add(new SimplifiedEvent
            {
                Id = entity.Id.ToString(),
                Title = entity.Title,
                Start = Timestamp.FromDateTime(occStart),
                End = occEnd.HasValue ? Timestamp.FromDateTime(occEnd.Value) : null,
                AllDay = entity.AllDay,
                Category = entity.Category
            });
        }

        return response;
    }

    public override async Task<Empty> RemoveEvent(RemoveEventRequest request, ServerCallContext context)
    {
        if (string.IsNullOrEmpty(request.Id))
        {
            throw new RpcException(new Status(Grpc.Core.StatusCode.InvalidArgument, "Event ID cannot be null or empty"));
        }

        if (!Guid.TryParse(request.Id, out var eventId))
        {
            throw new RpcException(new Status(Grpc.Core.StatusCode.InvalidArgument, "Event ID must be a valid GUID"));
        }

        var eventEntity = await _dbContext.Events.FindAsync(eventId);
        if (eventEntity == null)
        {
            throw new RpcException(new Status(Grpc.Core.StatusCode.NotFound, $"Event with ID {eventId} not found"));
        }

        _dbContext.Events.Remove(eventEntity);
        await _dbContext.SaveChangesAsync();

        return new Empty();
    }

    public override async Task<Empty> RemoveOccurrence(RemoveOccurrenceRequest request, ServerCallContext context)
    {
        if (string.IsNullOrEmpty(request.EventId))
        {
            throw new RpcException(new Status(Grpc.Core.StatusCode.InvalidArgument, "Event ID cannot be null or empty"));
        }

        if (!Guid.TryParse(request.EventId, out var eventId))
        {
            throw new RpcException(new Status(Grpc.Core.StatusCode.InvalidArgument, "Event ID must be a valid GUID"));
        }

        if (request.OccurrenceDate == null)
        {
            throw new RpcException(new Status(Grpc.Core.StatusCode.InvalidArgument, "Occurrence date cannot be null"));
        }

        var eventEntity = await _dbContext.Events.FindAsync(eventId);
        if (eventEntity == null)
        {
            throw new RpcException(new Status(Grpc.Core.StatusCode.NotFound, $"Event with ID {eventId} not found"));
        }

        var occurrenceDateTime = request.OccurrenceDate.ToDateTime();

        // Initialize ExceptDates if null
        if (eventEntity.ExceptDates == null)
        {
            eventEntity.ExceptDates = new[] { occurrenceDateTime };
        }
        else
        {
            // Check if the date is already in the exception list
            if (!eventEntity.ExceptDates.Contains(occurrenceDateTime))
            {
                var exceptDatesList = eventEntity.ExceptDates.ToList();
                exceptDatesList.Add(occurrenceDateTime);
                eventEntity.ExceptDates = exceptDatesList.ToArray();
            }
        }

        _dbContext.Events.Update(eventEntity);
        await _dbContext.SaveChangesAsync();

        return new Empty();
    }

    public override async Task<Empty> UpdateEvent(UpdateEventRequest request, ServerCallContext context)
    {
        if (string.IsNullOrEmpty(request.Event.Id))
        {
            throw new RpcException(new Status(Grpc.Core.StatusCode.InvalidArgument, "Event ID cannot be null or empty"));
        }

        if (!Guid.TryParse(request.Event.Id, out var eventId))
        {
            throw new RpcException(new Status(Grpc.Core.StatusCode.InvalidArgument, "Event ID must be a valid GUID"));
        }

        if (request.Event == null)
        {
            throw new RpcException(new Status(Grpc.Core.StatusCode.InvalidArgument, "Event cannot be null"));
        }

        var eventEntity = await _dbContext.Events.FindAsync(eventId);
        if (eventEntity == null)
        {
            throw new RpcException(new Status(Grpc.Core.StatusCode.NotFound, $"Event with ID {eventId} not found"));
        }

        // Update event fields
        eventEntity.Title = request.Event.Title;
        eventEntity.Description = request.Event.Description;
        eventEntity.Organizer = Guid.Parse(request.Event.Organizer);
        eventEntity.Start = request.Event.Start?.ToDateTime();
        eventEntity.End = request.Event.End?.ToDateTime();
        eventEntity.Rrules = request.Event.Rrules?.ToList().ToArray();
        eventEntity.Category = request.Event.Category;
        eventEntity.AllDay = request.Event.AllDay;
        eventEntity.ExceptDates = request.Event.ExceptDates?.Select(ts => ts.ToDateTime()).ToArray();

        _dbContext.Events.Update(eventEntity);
        await _dbContext.SaveChangesAsync();

        return new Empty();
    }
}