import * as stylex from '@stylexjs/stylex';
import { Plus } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { useNotes, type NoteMessage } from '../api/hooks/useNotes';
import { Button } from '../components/ui/Button';
import { PageError } from '../components/ui/PageError';
import { PageHeader } from '../components/ui/PageHeader';
import { PageSkeleton } from '../components/ui/PageSkeleton';
import { NoteCard } from '../features/notes/NoteCard';
import { NoteDialog } from '../features/notes/NoteDialog';
import { NotesEmpty } from '../features/notes/NotesEmpty';
import { NotesSearch } from '../features/notes/NotesSearch';
import { usePeople } from '../lib/people';

const styles = stylex.create({
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(268px, 1fr))',
    gap: '16px',
    alignItems: 'stretch',
  },
});

export function NotesPage() {
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const notes = useNotes(deferredSearch);
  const { nameFor } = usePeople();
  const [dialog, setDialog] = useState<{ note?: NoteMessage } | null>(null);

  const results = notes.data ?? [];
  const searching = deferredSearch.trim().length > 0;
  const resultCount = searching && !notes.isPending ? results.length : undefined;

  return (
    <>
      <PageHeader
        eyebrow="Notes on the fridge"
        title="The house remembers."
        description="Passwords, bin days, the plumber's number, and the things nobody should have to ask twice."
        actions={
          <Button icon={<Plus size={15} />} onClick={() => setDialog({})}>
            New note
          </Button>
        }
      />

      <NotesSearch
        search={search}
        query={deferredSearch.trim()}
        resultCount={resultCount}
        onSearchChange={setSearch}
        onClear={() => setSearch('')}
      />

      {notes.isPending ? (
        <PageSkeleton rows={4} />
      ) : notes.isError ? (
        <PageError error={notes.error} onRetry={() => notes.refetch()} />
      ) : results.length === 0 ? (
        <NotesEmpty
          searching={searching}
          onClear={() => setSearch('')}
          onAdd={() => setDialog({})}
        />
      ) : (
        <div {...stylex.props(styles.grid)}>
          {results.map((note, index) => (
            <NoteCard
              key={note.id}
              note={note}
              author={nameFor(note.createdBy) ?? 'Household'}
              variant={index % 5 === 1 ? 'warm' : index % 5 === 3 ? 'olive' : 'plain'}
              onEdit={() => setDialog({ note })}
            />
          ))}
        </div>
      )}

      {dialog && <NoteDialog note={dialog.note} onClose={() => setDialog(null)} />}
    </>
  );
}
