using Ical.Net;
using Ical.Net.CalendarComponents;
using Ical.Net.DataTypes;

namespace HumeHub.Tasks.Utils;

public static class RecurrenceUtils
{
    public static List<Entities.Task> GenerateRecurringTaskOccurrences(
        Entities.RecurringTask recurringTask,
        DateTime rangeStart,
        DateTime rangeEnd)
    {
        var occurrences = new List<Entities.Task>();

        try
        {
            // Create a calendar event to leverage iCal.NET's RRULE parsing
            var calEvent = new CalendarEvent
            {
                Summary = recurringTask.Title,
                Start = new CalDateTime(recurringTask.CreatedAt),
                DtStart = new CalDateTime(recurringTask.CreatedAt)
            };

            // Parse and add the RRULE
            if (!string.IsNullOrEmpty(recurringTask.RRule))
            {
                var rrule = new RecurrencePattern(recurringTask.RRule);
                calEvent.RecurrenceRules.Add(rrule);
            }

            // Get occurrences from the task creation date, filtered to the range
            var allOccurrences = calEvent.GetOccurrences(new CalDateTime(recurringTask.CreatedAt))
                .TakeWhileBefore(new CalDateTime(rangeEnd))
                .Where(o => o.Period.StartTime.AsUtc >= rangeStart)
                .Select(o => o.Period.StartTime.AsUtc)
                .ToList();

            // Create a task instance for each occurrence
            foreach (var occurrenceDate in allOccurrences)
            {
                var taskInstance = new Entities.Task
                {
                    Id = Guid.NewGuid(),
                    Title = recurringTask.Title,
                    Description = recurringTask.Description,
                    CreatedBy = recurringTask.CreatedBy,
                    AssignedTo = recurringTask.AssignedTo,
                    Done = false,
                    DoneAt = null,
                    RecurringTaskId = recurringTask.Id,
                    CreatedAt = occurrenceDate
                };

                occurrences.Add(taskInstance);
            }
        }
        catch (Exception ex)
        {
            // If RRULE parsing fails, log and skip this recurring task
            System.Diagnostics.Debug.WriteLine($"Error parsing RRULE for recurring task {recurringTask.Id}: {ex.Message}");
        }

        return occurrences;
    }
}
