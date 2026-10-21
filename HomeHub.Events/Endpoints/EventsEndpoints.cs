using HomeHub.Events.Contexts;
using HomeHub.Events.Mappers;
using Ical.Net;
using Ical.Net.CalendarComponents;
using Ical.Net.DataTypes;
using Microsoft.EntityFrameworkCore;

namespace HomeHub.Events.Endpoints;

public static class EventsEndpoints
{
    public static void MapEventsEndpoints(this WebApplication app)
    {
        app.MapGet("/api/events/ics", GetEventsAsIcs)
            .WithName("GetEventsAsIcs")
            .Produces(StatusCodes.Status200OK, contentType: "text/calendar")
            .WithDescription("Get events in a date range as an ICS calendar file");
    }

    private static async Task<IResult> GetEventsAsIcs(
        DateTime start,
        DateTime end,
        EventDbContext dbContext,
        ILogger<Program> logger)
    {
        try
        {
            var rangeStart = start;
            var rangeEnd = end;

            if (rangeStart >= rangeEnd)
            {
                return Results.BadRequest("Start date must be before end date");
            }

            // Load recurring events that could have occurrences in range
            var recurringEvents = await dbContext.Events
                .Where(e => e.Rrules != null && e.Rrules.Length > 0 &&
                            (e.End == null || e.End > rangeStart) &&
                            (!e.Start.HasValue || e.Start <= rangeEnd))
                .ToListAsync();

            // Load non-recurring events within the specified range
            var nonRecurringEvents = await dbContext.Events
                .Where(e => (e.Rrules == null || e.Rrules.Length == 0) &&
                            e.Start.HasValue &&
                            e.Start <= rangeEnd &&
                            (!e.End.HasValue || e.End >= rangeStart))
                .ToListAsync();

            var allEvents = recurringEvents.Concat(nonRecurringEvents).ToList();

            // Create a calendar
            var calendar = new Calendar
            {
                Method = "PUBLISH",
                ProductId = "-//HomeHub//HomeHub Events//EN",
                Version = "2.0"
            };

            // Add events to calendar
            foreach (var evt in allEvents)
            {
                var calEvent = evt.ToCalendarEvent();

                if (calEvent.RecurrenceRules.Count > 0)
                {
                    // Recurring event - get occurrences in range
                    var eventOccurrences = calEvent.GetOccurrences(new CalDateTime(rangeStart))
                        .TakeWhileBefore(new CalDateTime(rangeEnd));

                    foreach (var occurrence in eventOccurrences)
                    {
                        var occurrenceEvent = new CalendarEvent
                        {
                            Uid = $"{evt.Id}-{occurrence.Period.StartTime.Value:yyyyMMddHHmmss}@HomeHub.local",
                            Summary = evt.Title,
                            Description = evt.Description,
                            Start = occurrence.Period.StartTime,
                            End = occurrence.Period.EndTime,
                        };

                        calendar.Events.Add(occurrenceEvent);
                    }
                }
                else if (evt.Start.HasValue && evt.Start >= rangeStart && evt.Start <= rangeEnd)
                {
                    // Non-recurring event in range
                    var singleEvent = new CalendarEvent
                    {
                        Uid = $"{evt.Id}@HomeHub.local",
                        Summary = evt.Title,
                        Description = evt.Description,
                        Start = new CalDateTime(evt.Start.Value, evt.AllDay),
                        End = evt.End.HasValue ? new CalDateTime(evt.End.Value, evt.AllDay) : null,

                    };

                    calendar.Events.Add(singleEvent);
                }
            }

            // Serialize calendar to ICS format
            var icsContent = calendar.ToString();

            // Return as ICS file
            return Results.File(
                System.Text.Encoding.UTF8.GetBytes(icsContent ?? string.Empty),
                "text/calendar",
                $"events_{start:yyyyMMdd}_{end:yyyyMMdd}.ics");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error generating ICS calendar");
            return Results.StatusCode(StatusCodes.Status500InternalServerError);
        }
    }
}
