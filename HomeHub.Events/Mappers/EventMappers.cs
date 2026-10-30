using Ical.Net.CalendarComponents;
using Ical.Net.DataTypes;

namespace HomeHub.Events.Mappers;

public static class EventMappers
{
    public static CalendarEvent ToCalendarEvent(this Entities.Event @event)
    {
        var calendarEvent = new CalendarEvent
        {
            Summary = @event.Title,
            Description = @event.Description
        };

        calendarEvent.Start = new CalDateTime(@event.Start, !@event.AllDay);

        if (@event.End.HasValue)
        {
            calendarEvent.End = new CalDateTime(@event.End.Value, !@event.AllDay);
        }

        if (@event.Rrules != null && @event.Rrules.Length != 0)
        {
            foreach (var rrule in @event.Rrules)
            {
                calendarEvent.RecurrenceRules.Add(new RecurrencePattern(rrule));
            }
        }

        if (@event.ExceptDates != null && @event.ExceptDates.Length > 0)
        {
            foreach (var exceptDate in @event.ExceptDates)
            {

                calendarEvent.ExceptionDates.Add(new CalDateTime(exceptDate));
            }
        }

        return calendarEvent;
    }
}