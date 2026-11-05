import { useForm } from '@tanstack/react-form';
import { useCallback, useState } from 'react';
import type { NoteMessage } from '../../api/hooks/useNotes';
import { useSaveNote } from '../../api/hooks/useSaveNote';
import { errorMessage, isConcurrencyConflict } from '../../lib/errors';
import { toast } from '../../lib/toasts';

interface NoteFormValues {
  title: string;
  content: string;
}

export function useNoteEditor(note: NoteMessage | undefined, onClose: () => void) {
  const save = useSaveNote();
  const [serverError, setServerError] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);

  const persist = useCallback(
    async (force: boolean, value: NoteFormValues) => {
      setServerError(null);
      setConflict(false);
      if (!value.title.trim()) return;
      try {
        await save.mutateAsync({
          id: note?.id,
          title: value.title,
          content: value.content,
          version: note?.version,
          force,
        });
        toast(note ? 'Note updated.' : 'Note pinned.', 'success');
        onClose();
      } catch (error) {
        if (isConcurrencyConflict(error)) {
          setConflict(true);
          return;
        }
        setServerError(errorMessage(error));
      }
    },
    [note, onClose, save],
  );

  const form = useForm({
    defaultValues: {
      title: note?.title ?? '',
      content: note?.content ?? '',
    },
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

  return { form, serverError, conflict, overwrite, discard, saving: save.isPending };
}
