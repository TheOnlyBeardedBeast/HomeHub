import { NotebookPen, Plus, Search } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';

export function NotesEmpty({
  searching,
  onClear,
  onAdd,
}: {
  searching: boolean;
  onClear: () => void;
  onAdd: () => void;
}) {
  return (
    <EmptyState
      icon={searching ? Search : NotebookPen}
      title={searching ? 'Nothing matches' : 'The fridge door is empty'}
      description={
        searching
          ? 'Try a different word, or clear the search to see every note.'
          : 'Pin the wifi password, the bin schedule, or anything the house keeps asking about.'
      }
      action={
        searching ? (
          <Button variant="secondary" size="sm" onClick={onClear}>
            Clear search
          </Button>
        ) : (
          <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={onAdd}>
            Pin the first note
          </Button>
        )
      }
    />
  );
}
