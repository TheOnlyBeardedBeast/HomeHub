import { useState } from 'react';
import type { NoteMessage } from '../api/hooks/useNotes';
import type { TaskMessage } from '../api/hooks/useTasks';
import { PageError } from '../components/ui/PageError';
import { PageSkeleton } from '../components/ui/PageSkeleton';
import { EventDialog, type EventDialogTarget } from '../features/calendar/EventDialog';
import { NoteDialog } from '../features/notes/NoteDialog';
import { TaskDialog } from '../features/tasks/TaskDialog';
import { TodayHeader } from '../features/today/TodayHeader';
import { TodayLayout } from '../features/today/TodayLayout';
import { TodayStatusHeader } from '../features/today/TodayStatusHeader';
import { readTodayView, saveTodayView, type TodayView } from '../features/today/todayView';
import { useTodayData } from '../features/today/useTodayData';
import type { SimplifiedEvent } from '../gen/events_pb';
import { toDate } from '../lib/format';

export function TodayPage() {
  const data = useTodayData();
  const [view, setView] = useState<TodayView>(readTodayView);
  const [eventTarget, setEventTarget] = useState<EventDialogTarget | null>(null);
  const [taskDialog, setTaskDialog] = useState<{ task?: TaskMessage } | null>(null);
  const [noteDialog, setNoteDialog] = useState<{ note?: NoteMessage } | null>(null);

  function changeView(next: TodayView) {
    setView(next);
    saveTodayView(next);
  }

  function openEvent(event: SimplifiedEvent) {
    setEventTarget({ id: event.id, occurrence: toDate(event.start) });
  }

  function addEvent() {
    setEventTarget({ initialDate: data.now });
  }

  function addTask() {
    setTaskDialog({});
  }

  const pending = data.events.isPending || data.tasks.isPending;
  const failed = data.events.isError || data.tasks.isError;

  return (
    <>
      {pending || failed ? (
        <TodayStatusHeader now={data.now} firstName={data.firstName} />
      ) : (
        <TodayHeader
          now={data.now}
          firstName={data.firstName}
          view={view}
          onViewChange={changeView}
          onNewEvent={addEvent}
          onAddTask={addTask}
        />
      )}

      {pending ? (
        <PageSkeleton rows={4} />
      ) : failed ? (
        <PageError
          error={data.events.error ?? data.tasks.error}
          onRetry={() => {
            data.events.refetch();
            data.tasks.refetch();
          }}
        />
      ) : (
        <>
          <TodayLayout
            data={data}
            view={view}
            onOpenEvent={openEvent}
            onAddEvent={addEvent}
            onEditTask={(task) => setTaskDialog({ task })}
            onAddTask={addTask}
            onOpenNote={(note) => setNoteDialog({ note })}
          />
          {eventTarget && <EventDialog target={eventTarget} onClose={() => setEventTarget(null)} />}
          {taskDialog && <TaskDialog task={taskDialog.task} onClose={() => setTaskDialog(null)} />}
          {noteDialog && <NoteDialog note={noteDialog.note} onClose={() => setNoteDialog(null)} />}
        </>
      )}
    </>
  );
}
