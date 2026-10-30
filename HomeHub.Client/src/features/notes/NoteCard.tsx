import * as stylex from '@stylexjs/stylex';
import { Pencil } from 'lucide-react';
import type { NoteMessage } from '../../api/hooks/useNotes';
import { Avatar } from '../../components/ui/Avatar';
import { IconButton } from '../../components/ui/Button';
import { Markdown } from '../../components/ui/Markdown';
import { formatRelative, toDate } from '../../lib/format';
import { colors, fonts, motion, radius, shadow } from '../../styles/tokens.stylex';

const styles = stylex.create({
  note: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    minHeight: '200px',
    padding: '20px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    boxShadow: shadow.soft,
    textAlign: 'left',
    transitionProperty: 'transform, box-shadow, border-color',
    transitionDuration: motion.base,
    transitionTimingFunction: motion.ease,
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: shadow.lifted,
      borderColor: colors.borderStrong,
    },
  },
  noteWarm: {
    backgroundColor: colors.accentWash,
    borderColor: colors.accentSoft,
  },
  noteOlive: {
    backgroundColor: colors.oliveSoft,
    borderColor: colors.oliveBorder,
  },
  noteHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '8px',
  },
  noteTitle: {
    flex: 1,
    minWidth: 0,
    fontFamily: fonts.display,
    fontSize: '23px',
    fontWeight: 520,
    letterSpacing: '-0.025em',
    lineHeight: 1.18,
    color: colors.ink,
    margin: 0,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  noteBody: {
    flex: 1,
    maxHeight: '9.9em',
    overflow: 'hidden',
    fontFamily: fonts.sans,
    fontSize: '12.5px',
    lineHeight: 1.65,
    color: colors.inkMuted,
    margin: 0,
  },
  noteMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    marginTop: 'auto',
    paddingTop: '10px',
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: colors.borderFaint,
    fontFamily: fonts.sans,
    fontSize: '10.5px',
    color: colors.inkMuted,
    minWidth: 0,
  },
  noteAuthor: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight: 570,
    color: colors.inkSoft,
  },
  noteTime: { marginLeft: 'auto', flexShrink: 0, color: colors.inkFaint },
});

export function NoteCard({
  note,
  author,
  variant,
  onEdit,
}: {
  note: NoteMessage;
  author: string;
  variant: 'plain' | 'warm' | 'olive';
  onEdit: () => void;
}) {
  const created = toDate(note.createdAt);
  const updated = toDate(note.updatedAt);

  return (
    <article
      {...stylex.props(
        styles.note,
        variant === 'warm' && styles.noteWarm,
        variant === 'olive' && styles.noteOlive,
      )}
    >
      <div {...stylex.props(styles.noteHeader)}>
        <span {...stylex.props(styles.noteTitle)}>{note.title || 'Untitled note'}</span>
        <IconButton label={`Edit ${note.title || 'note'}`} size="sm" onClick={onEdit}>
          <Pencil size={14} />
        </IconButton>
      </div>
      <div {...stylex.props(styles.noteBody)}>
        {note.content ? <Markdown>{note.content}</Markdown> : 'No further detail.'}
      </div>
      <span {...stylex.props(styles.noteMeta)}>
        <Avatar name={author} size="xs" />
        <span {...stylex.props(styles.noteAuthor)}>{author}</span>
        <span {...stylex.props(styles.noteTime)}>
          {updated ? formatRelative(updated) : created ? formatRelative(created) : ''}
        </span>
      </span>
    </article>
  );
}
