import { useDeleteEvent } from '../../api/hooks/useDeleteEvent';
import { useSkipOccurrence } from '../../api/hooks/useSkipOccurrence';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import type { Event as EventMessage } from '../../gen/events_pb';
import { errorMessage } from '../../lib/errors';
import { toast } from '../../lib/toasts';

export function EventConfirmDialogs({
  event,
  occurrence,
  confirming,
  onDismiss,
  onClose,
}: {
  event?: EventMessage;
  occurrence?: Date;
  confirming: 'delete' | 'skip' | null;
  onDismiss: () => void;
  onClose: () => void;
}) {
  const remove = useDeleteEvent();
  const skip = useSkipOccurrence();
  const isRecurring = Boolean(event?.rrules.length);

  return (
    <>
      <ConfirmDialog
        open={confirming === 'delete'}
        title="Delete this event?"
        description={
          isRecurring
            ? 'The whole repeating series will be removed from the household calendar.'
            : 'This event will be removed from the household calendar.'
        }
        busy={remove.isPending}
        onClose={onDismiss}
        onConfirm={() => {
          if (!event) return;
          remove.mutate(event.id, {
            onSuccess: () => {
              toast('Event deleted.', 'success');
              onDismiss();
              onClose();
            },
            onError: (error) => {
              onDismiss();
              toast(errorMessage(error), 'error');
            },
          });
        }}
      />

      <ConfirmDialog
        open={confirming === 'skip'}
        title="Skip this occurrence?"
        description={`${occurrence ? occurrence.toDateString() : 'This day'} will be removed from the series; the rest stays.`}
        confirmLabel="Skip day"
        destructive={false}
        busy={skip.isPending}
        onClose={onDismiss}
        onConfirm={() => {
          if (!event || !occurrence) return;
          skip.mutate(
            { eventId: event.id, occurrence },
            {
              onSuccess: () => {
                toast('Occurrence skipped.', 'success');
                onDismiss();
                onClose();
              },
              onError: (error) => {
                onDismiss();
                toast(errorMessage(error), 'error');
              },
            },
          );
        }}
      />
    </>
  );
}
