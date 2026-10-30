import * as stylex from '@stylexjs/stylex';
import { Repeat2 } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { colors, fonts } from '../../styles/tokens.stylex';

const styles = stylex.create({
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    flexWrap: 'wrap',
    fontFamily: fonts.sans,
    fontSize: '10.5px',
    color: colors.inkFaint,
  },
  metaItem: { display: 'inline-flex', alignItems: 'center', gap: '4px' },
});

export function TaskMeta({
  recurring,
  assigneeName,
  doneAt,
  failed,
}: {
  recurring: boolean;
  assigneeName?: string;
  doneAt?: string;
  failed: boolean;
}) {
  return (
    <span {...stylex.props(styles.meta)}>
      {recurring && (
        <span {...stylex.props(styles.metaItem)} title="Repeats">
          <Repeat2 size={11} /> Repeats
        </span>
      )}
      {assigneeName ? (
        <span {...stylex.props(styles.metaItem)}>
          <Avatar name={assigneeName} size="xs" /> {assigneeName}
        </span>
      ) : (
        <span>Anyone</span>
      )}
      {doneAt && <span {...stylex.props(styles.metaItem)}>· done {doneAt}</span>}
      {failed && <span style={{ color: colors.danger }}>· could not update</span>}
    </span>
  );
}
