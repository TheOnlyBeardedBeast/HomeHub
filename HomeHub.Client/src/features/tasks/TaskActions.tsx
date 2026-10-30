import * as stylex from '@stylexjs/stylex';
import { Pencil, Trash2 } from 'lucide-react';
import { IconButton } from '../../components/ui/Button';

const styles = stylex.create({
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1px',
  },
});

export function TaskActions({
  title,
  onEdit,
  onDelete,
}: {
  title: string;
  onEdit?: () => void;
  onDelete: () => void;
}) {
  return (
    <div {...stylex.props(styles.actions)}>
      {onEdit && (
        <IconButton label={`Edit ${title}`} size="sm" onClick={onEdit}>
          <Pencil size={13} />
        </IconButton>
      )}
      <IconButton label={`Delete ${title}`} size="sm" onClick={onDelete}>
        <Trash2 size={13} />
      </IconButton>
    </div>
  );
}
