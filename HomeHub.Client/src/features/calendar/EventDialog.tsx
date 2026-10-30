import * as stylex from '@stylexjs/stylex';
import { useEvent } from '../../api/hooks/useEvent';
import { Button } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';
import { PageError } from '../../components/ui/PageError';
import { PageSkeleton } from '../../components/ui/PageSkeleton';
import { toDate } from '../../lib/format';
import { space } from '../../styles/tokens.stylex';
import { EventEditor } from './EventEditor';
import type { EventDialogTarget } from './eventForm';

export type { EventDialogTarget } from './eventForm';

const styles = stylex.create({
  loading: { paddingBlock: space.s4 },
});

export function EventDialog({
  target,
  onClose,
}: {
  target: EventDialogTarget;
  onClose: () => void;
}) {
  const event = useEvent(target.id ?? null);

  if (!target.id) {
    return <EventEditor initialDate={target.initialDate} onClose={onClose} />;
  }

  if (event.isPending) {
    return (
      <Dialog open onClose={onClose} title="Event">
        <div {...stylex.props(styles.loading)}>
          <PageSkeleton rows={3} />
        </div>
      </Dialog>
    );
  }

  if (event.isError || !event.data) {
    return (
      <Dialog
        open
        onClose={onClose}
        title="Event"
        footer={<Button onClick={onClose}>Close</Button>}
      >
        <PageError error={event.error} onRetry={() => event.refetch()} />
      </Dialog>
    );
  }

  return (
    <EventEditor
      key={event.data.id}
      event={event.data}
      occurrence={target.occurrence ?? toDate(event.data.start)}
      onClose={onClose}
    />
  );
}
