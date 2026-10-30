import * as stylex from '@stylexjs/stylex';
import { Link } from '@tanstack/react-router';
import { ArrowRight, StickyNote } from 'lucide-react';
import type { NoteMessage } from '../../api/hooks/useNotes';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Markdown } from '../../components/ui/Markdown';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatRelative, toDate } from '../../lib/format';
import { colors, fonts } from '../../styles/tokens.stylex';
import { railStyles as styles } from './todayRailStyles';

const noteStyles = stylex.create({
  noteTitle: {
    fontFamily: fonts.display,
    fontSize: '20px',
    fontWeight: 540,
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
    color: colors.ink,
    margin: 0,
  },
  noteBody: {
    maxHeight: '6.4em',
    overflow: 'hidden',
    fontFamily: fonts.sans,
    fontSize: '12.5px',
    lineHeight: 1.6,
    color: colors.inkMuted,
    margin: '7px 0 12px',
  },
  noteMeta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    fontFamily: fonts.sans,
    fontSize: '10.5px',
    color: colors.inkFaint,
  },
});

export function FridgeNote({
  note,
  pending,
  nameFor,
  onOpen,
}: {
  note?: NoteMessage;
  pending: boolean;
  nameFor: (id?: string) => string | undefined;
  onOpen: (note: NoteMessage) => void;
}) {
  return (
    <section>
      <div {...stylex.props(styles.railHeading)}>
        <span {...stylex.props(styles.railTitle)}>
          <StickyNote size={13} /> From the fridge
        </span>
        <Link to="/notes" {...stylex.props(styles.railLink)}>
          All notes <ArrowRight size={11} />
        </Link>
      </div>
      <Card padding="md">
        {pending ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Skeleton width="70%" height={18} />
            <Skeleton height={12} />
            <Skeleton width="85%" height={12} />
            <Skeleton width="55%" height={12} />
          </div>
        ) : note ? (
          <>
            <h3 {...stylex.props(noteStyles.noteTitle)}>{note.title}</h3>
            <div {...stylex.props(noteStyles.noteBody)}>
              {note.content ? <Markdown>{note.content}</Markdown> : 'No further detail.'}
            </div>
            <div {...stylex.props(noteStyles.noteMeta)}>
              <span>
                {nameFor(note.createdBy) ?? 'Household'} ·{' '}
                {note.updatedAt
                  ? `updated ${formatRelative(toDate(note.updatedAt) ?? new Date())}`
                  : toDate(note.createdAt)
                    ? formatRelative(toDate(note.createdAt)!)
                    : ''}
              </span>
              <Button variant="quiet" size="sm" onClick={() => onOpen(note)}>
                Open
              </Button>
            </div>
          </>
        ) : (
          <p {...stylex.props(styles.railEmpty)}>
            The fridge door is empty. Pin the wifi password, bin day, or anything the house keeps
            asking about.
          </p>
        )}
      </Card>
    </section>
  );
}
