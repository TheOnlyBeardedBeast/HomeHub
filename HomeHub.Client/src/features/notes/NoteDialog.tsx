import * as stylex from '@stylexjs/stylex';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useDeleteNote } from '../../api/hooks/useDeleteNote';
import type { NoteMessage } from '../../api/hooks/useNotes';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ConflictNotice } from '../../components/ui/ConflictNotice';
import { Dialog } from '../../components/ui/Dialog';
import { FormError } from '../../components/ui/FormError';
import { TextAreaField } from '../../components/ui/TextAreaField';
import { TextField } from '../../components/ui/TextField';
import { Markdown } from '../../components/ui/Markdown';
import { errorMessage } from '../../lib/errors';
import { toast } from '../../lib/toasts';
import { colors, fonts, radius, space } from '../../styles/tokens.stylex';
import { useNoteEditor } from './useNoteEditor';

const styles = stylex.create({
  form: { display: 'flex', flexDirection: 'column', gap: space.s4 },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.s3,
    width: '100%',
    flexWrap: 'wrap',
  },
  actionGroup: { display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' },
  previewLabel: {
    display: 'block',
    fontFamily: fonts.sans,
    fontSize: '12.5px',
    fontWeight: 620,
    color: colors.inkSoft,
    marginBottom: '6px',
  },
  preview: {
    maxHeight: '260px',
    padding: '12px 14px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    overflowY: 'auto',
    fontFamily: fonts.sans,
    fontSize: '13.5px',
    lineHeight: 1.65,
    color: colors.inkSoft,
  },
});

export function NoteDialog({ note, onClose }: { note?: NoteMessage; onClose: () => void }) {
  const { form, serverError, conflict, overwrite, discard, saving } = useNoteEditor(note, onClose);
  const remove = useDeleteNote();
  const [confirming, setConfirming] = useState(false);
  return (
    <>
      <Dialog
        open
        onClose={onClose}
        title={note ? 'Edit note' : 'New note'}
        description="For the things everyone needs to remember."
        size="lg"
        footer={
          <div {...stylex.props(styles.footer)}>
            {note && (
              <Button
                variant="quiet"
                size="sm"
                icon={<Trash2 size={14} />}
                onClick={() => setConfirming(true)}
              >
                Delete
              </Button>
            )}
            <div {...stylex.props(styles.actionGroup)}>
              <Button variant="ghost" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button loading={saving} onClick={() => form.handleSubmit()}>
                {note ? 'Save note' : 'Pin note'}
              </Button>
            </div>
          </div>
        }
      >
        <form
          {...stylex.props(styles.form)}
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
        >
          {serverError && <FormError message={serverError} />}
          {conflict && (
            <ConflictNotice
              message="This note changed on another device while you were editing."
              busy={saving}
              onOverwrite={overwrite}
              onDiscard={discard}
            />
          )}

          <form.Field
            name="title"
            validators={{
              onSubmit: ({ value }) => (value.trim() ? undefined : 'Give the note a title.'),
            }}
          >
            {(field) => (
              <TextField
                field={field}
                label="Title"
                placeholder="Wifi password, bin day, boiler quirks…"
                autoFocus
              />
            )}
          </form.Field>

          <form.Field name="content">
            {(field) => (
              <>
                <TextAreaField
                  field={field}
                  label="Note"
                  hint="Markdown supported — headings, lists, links, tables."
                  placeholder="Write it as if you are leaving it on the fridge door."
                  rows={9}
                />
                {field.state.value.trim() ? (
                  <div>
                    <span {...stylex.props(styles.previewLabel)}>Preview</span>
                    <div {...stylex.props(styles.preview)}>
                      <Markdown>{field.state.value}</Markdown>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </form.Field>
        </form>
      </Dialog>

      <ConfirmDialog
        open={confirming}
        title="Delete this note?"
        description="The note will be removed from the fridge for everyone."
        busy={remove.isPending}
        onClose={() => setConfirming(false)}
        onConfirm={() => {
          if (!note) return;
          remove.mutate(note.id, {
            onSuccess: () => {
              toast('Note deleted.', 'success');
              setConfirming(false);
              onClose();
            },
            onError: (error) => {
              setConfirming(false);
              toast(errorMessage(error), 'error');
            },
          });
        }}
      />
    </>
  );
}
