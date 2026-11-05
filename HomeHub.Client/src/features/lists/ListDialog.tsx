import { useForm } from '@tanstack/react-form';
import * as stylex from '@stylexjs/stylex';
import { Trash2 } from 'lucide-react';
import { useCallback, useId, useState } from 'react';
import { useDeleteList } from '../../api/hooks/useDeleteList';
import { useSaveList } from '../../api/hooks/useSaveList';
import type { ListMessage } from '../../api/hooks/useLists';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ConflictNotice } from '../../components/ui/ConflictNotice';
import { Dialog } from '../../components/ui/Dialog';
import { FormError } from '../../components/ui/FormError';
import { TextField } from '../../components/ui/TextField';
import { errorMessage, isConcurrencyConflict } from '../../lib/errors';
import { toast } from '../../lib/toasts';
import { space } from '../../styles/tokens.stylex';
import { ListItemsField } from './ListItemsField';

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
});

export function ListDialog({ list, onClose }: { list?: ListMessage; onClose: () => void }) {
  const save = useSaveList();
  const remove = useDeleteList();
  const itemId = useId();
  const [serverError, setServerError] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const persist = useCallback(
    async (force: boolean, value: { title: string; items: string[] }) => {
      setServerError(null);
      setConflict(false);
      const items = value.items.map((item) => item.trim()).filter(Boolean);
      if (!value.title.trim()) return;
      if (items.length === 0) {
        setServerError('Add at least one item to the list.');
        return;
      }
      try {
        await save.mutateAsync({
          id: list?.id,
          title: value.title,
          items,
          version: list?.version,
          force,
        });
        toast(list ? 'List updated.' : 'List started.', 'success');
        onClose();
      } catch (error) {
        if (isConcurrencyConflict(error)) {
          setConflict(true);
          return;
        }
        setServerError(errorMessage(error));
      }
    },
    [list, onClose, save],
  );

  const form = useForm({
    defaultValues: {
      title: list?.title ?? '',
      items: list?.content.length ? [...list.content] : [''],
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

  return (
    <>
      <Dialog
        open
        onClose={onClose}
        title={list ? 'Edit list' : 'New list'}
        description="Shopping, packing, the weekend plan — one list, shared."
        footer={
          <div {...stylex.props(styles.footer)}>
            {list && (
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
              <Button variant="ghost" onClick={onClose} disabled={save.isPending}>
                Cancel
              </Button>
              <Button loading={save.isPending} onClick={() => form.handleSubmit()}>
                {list ? 'Save list' : 'Create list'}
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
              message="This list changed on another device while you were editing."
              busy={save.isPending}
              onOverwrite={overwrite}
              onDiscard={discard}
            />
          )}

          <form.Field
            name="title"
            validators={{
              onSubmit: ({ value }) => (value.trim() ? undefined : 'Give the list a title.'),
            }}
          >
            {(field) => (
              <TextField
                field={field}
                label="List"
                placeholder="Weekly shop, camping kit, Saturday errands…"
                autoFocus
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' || event.nativeEvent.isComposing || save.isPending)
                    return;
                  event.preventDefault();
                  form.handleSubmit();
                }}
              />
            )}
          </form.Field>

          <ListItemsField form={form} itemId={itemId} />
        </form>
      </Dialog>

      <ConfirmDialog
        open={confirming}
        title="Delete this list?"
        description={`"${list?.title ?? 'This list'}" and its items will be removed for everyone.`}
        busy={remove.isPending}
        onClose={() => setConfirming(false)}
        onConfirm={() => {
          if (!list) return;
          remove.mutate(list.id, {
            onSuccess: () => {
              toast('List deleted.', 'success');
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
