import { useForm } from '@tanstack/react-form';
import { useCallback, useState } from 'react';
import { useSaveEvent } from '../../api/hooks/useSaveEvent';
import { ConflictNotice } from '../../components/ui/ConflictNotice';
import { Dialog } from '../../components/ui/Dialog';
import type { Event as EventMessage } from '../../gen/events_pb';
import { errorMessage, isConcurrencyConflict } from '../../lib/errors';
import { recurrenceError } from '../../lib/rrules';
import { toast } from '../../lib/toasts';
import { EventConfirmDialogs } from './EventConfirmDialogs';
import { EventFooter } from './EventFooter';
import { EventFormFields } from './EventFormFields';
import { draftFromValues, valuesFrom, type EventFormValues } from './eventForm';

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
  const [conflict, setConflict] = useState(false);
  const [confirming, setConfirming] = useState<'delete' | 'skip' | null>(null);
  const isRecurring = Boolean(event?.rrules.length);

  const persist = useCallback(
    async (force: boolean, value: EventFormValues) => {
      setServerError(null);
      setConflict(false);
      if (!value.title.trim()) return;

      const recurrenceProblem = recurrenceError(value.recurrence);
      if (recurrenceProblem) {
        setServerError(recurrenceProblem);
        return;
      }

      try {
        await save.mutateAsync({ ...draftFromValues(value, event), force });
        toast(event ? 'Event updated.' : 'Event added.', 'success');
        onClose();
      } catch (error) {
        if (isConcurrencyConflict(error)) {
          setConflict(true);
          return;
        }
        setServerError(errorMessage(error));
      }
    },
    [event, onClose, save],
  );

  const form = useForm({
    defaultValues: valuesFrom(event, initialDate),
    onSubmit: async ({ value }) => {
      await persist(false, value);
    },
  });

  const overwrite = useCallback(() => {
    void persist(true, form.state.values);
  }, [form.state.values, persist]);

  const discard = useCallback(() => {
    setConflict(false);
    onClose();
  }, [onClose]);

  const notice = conflict ? (
    <ConflictNotice
      message="This event changed on another device while you were editing."
      busy={save.isPending}
      onOverwrite={overwrite}
      onDiscard={discard}
    />
  ) : undefined;

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
          notice={notice}
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
