import * as stylex from '@stylexjs/stylex';
import { SkipForward, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import type { AppFormApi } from '../../components/ui/formApi';
import type { Event as EventMessage } from '../../gen/events_pb';
import { space } from '../../styles/tokens.stylex';
import type { EventFormValues } from './eventForm';

const styles = stylex.create({
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.s3,
    width: '100%',
    flexWrap: 'wrap',
  },
  footerActions: { display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' },
});

export function EventFooter({
  event,
  isRecurring,
  occurrence,
  savePending,
  form,
  onClose,
  onDelete,
  onSkip,
}: {
  event?: EventMessage;
  isRecurring: boolean;
  occurrence?: Date;
  savePending: boolean;
  form: AppFormApi<EventFormValues>;
  onClose: () => void;
  onDelete: () => void;
  onSkip: () => void;
}) {
  return (
    <div {...stylex.props(styles.footer)}>
      {event && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Button variant="quiet" size="sm" icon={<Trash2 size={14} />} onClick={onDelete}>
            Delete
          </Button>
          {isRecurring && occurrence && (
            <Button variant="quiet" size="sm" icon={<SkipForward size={14} />} onClick={onSkip}>
              Skip this day
            </Button>
          )}
        </div>
      )}
      <div {...stylex.props(styles.footerActions)}>
        <Button variant="ghost" size="md" onClick={onClose} disabled={savePending}>
          Cancel
        </Button>
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button
              size="md"
              loading={isSubmitting || savePending}
              onClick={() => form.handleSubmit()}
            >
              {event ? 'Save changes' : 'Add event'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </div>
  );
}
