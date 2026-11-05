import { Star } from 'lucide-react';
import { useCallback } from 'react';
import type { ListMessage } from '../../api/hooks/useLists';
import { usePrioritizeList } from '../../api/hooks/usePrioritizeList';
import { IconButton } from '../../components/ui/Button';
import { colors } from '../../styles/tokens.stylex';

export function PriorityListButton({ list }: { list: ListMessage }) {
  const prioritize = usePrioritizeList();
  const toggle = useCallback(() => {
    prioritize.mutate({ id: list.id, prioritized: !list.prioritized });
  }, [list.id, list.prioritized, prioritize]);

  const title = list.title || 'this list';

  return (
    <IconButton
      label={
        list.prioritized
          ? `Stop showing ${title} on the dashboard`
          : `Show ${title} on the dashboard`
      }
      size="sm"
      onClick={toggle}
      disabled={prioritize.isPending}
      style={list.prioritized ? { color: colors.accent } : undefined}
    >
      <Star size={14} fill={list.prioritized ? 'currentColor' : 'none'} />
    </IconButton>
  );
}
