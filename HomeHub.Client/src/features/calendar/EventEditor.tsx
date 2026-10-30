import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { useSaveEvent } from '../../api/hooks/useSaveEvent';
import { Dialog } from '../../components/ui/Dialog';
import type { Event as EventMessage } from '../../gen/events_pb';
import { errorMessage } from '../../lib/errors';
import { recurrenceError } from '../../lib/rrules';
import { toast } from '../../lib/toasts';
import { EventConfirmDialogs } from './EventConfirmDialogs';
import { EventFooter } from './EventFooter';
import { EventFormFields } from './EventFormFields';
import { draftFromValues, valuesFrom } from './eventForm';

export function EventEditor({
  event,
  occurrence,
  initialDate,
  onClose,
}: {
  event?: EventMessage;
  occurrence?: Date;
  initialDate?: Date;
  onClose: () => void;
}) {
  const save = useSaveEvent();
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<'delete' | 'skip' | null>(null);
  const isRecurring = Boolean(event?.rrules.length);

  const form = useForm({
    defaultValues: valuesFrom(event, initialDate),
    onSubmit: async ({ value }) => {
      setServerError(null);
      if (!value.title.trim()) return;

      const recurrenceProblem = recurrenceError(value.recurrence);
      if (recurrenceProblem) {
        setServerError(recurrenceProblem);
        return;
      }

      try {
        await save.mutateAsync(draftFromValues(value, event));
        toast(event ? 'Event updated.' : 'Event added.', 'success');
        onClose();
      } catch (error) {
        setServerError(errorMessage(error));
      }
    },
  });

  return (
    <>
      <Dialog
        open
        onClose={onClose}
        title={event ? 'Edit event' : 'New event'}
        description={
          isRecurring
            ? 'Changes apply to the whole series. Skip a single day from the footer.'
            : 'Add a moment to the household rhythm.'
        }
        footer={
          <EventFooter
            event={event}
            isRecurring={isRecurring}
            occurrence={occurrence}
            savePending={save.isPending}
            form={form}
            onClose={onClose}
            onDelete={() => setConfirming('delete')}
            onSkip={() => setConfirming('skip')}
          />
        }
      >
        <EventFormFields
          form={form}
          serverError={serverError}
          onSubmit={() => form.handleSubmit()}
        />
      </Dialog>

      <EventConfirmDialogs
        event={event}
        occurrence={occurrence}
        confirming={confirming}
        onDismiss={() => setConfirming(null)}
        onClose={onClose}
      />
    </>
  );
}
