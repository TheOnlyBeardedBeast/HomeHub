import * as stylex from '@stylexjs/stylex';
import { Check, Copy, ListChecks, Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import { useLists, type ListMessage } from '../api/hooks/useLists';
import { Button, IconButton } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { PageError } from '../components/ui/PageError';
import { PageHeader } from '../components/ui/PageHeader';
import { PageSkeleton } from '../components/ui/PageSkeleton';
import { ListDialog } from '../features/lists/ListDialog';
import { Markdown } from '../components/ui/Markdown';
import { formatRelative, plural, toDate } from '../lib/format';
import { usePeople } from '../lib/people';
import { toast } from '../lib/toasts';
import { colors, fonts, motion, radius, shadow } from '../styles/tokens.stylex';

const styles = stylex.create({
  page: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 'calc(100dvh - 98px)',
    '@media (max-width: 900px)': { minHeight: 'calc(100dvh - 184px)' },
  },
  scroller: {
    display: 'flex',
    alignItems: 'flex-start',
    flexGrow: 1,
    gap: '18px',
    overflowX: 'auto',
    overflowY: 'hidden',
    scrollSnapType: 'x mandatory',
    paddingBlock: '18px',
    marginTop: '-18px',
    '::-webkit-scrollbar': { height: '12px' },
    '::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
    '::-webkit-scrollbar-thumb': {
      backgroundColor: colors.accent,
      borderRadius: radius.pill,
      borderWidth: '4px',
      borderStyle: 'solid',
      borderColor: colors.canvas,
    },
    '::-webkit-scrollbar-thumb:hover': { backgroundColor: colors.accentHover },
    ':focus-visible': { outline: 'none', boxShadow: shadow.ring, borderRadius: radius.lg },
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    flexShrink: 0,
    flexBasis: 'calc((100% - 36px) / 3)',
    scrollSnapAlign: 'start',
    padding: '20px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    boxShadow: shadow.soft,
    transitionProperty: 'border-color, box-shadow',
    transitionDuration: motion.base,
    ':hover': { borderColor: colors.borderStrong, boxShadow: shadow.lifted },
    '@media (max-width: 1200px)': { flexBasis: 'calc((100% - 18px) / 2)' },
    '@media (max-width: 700px)': { flexBasis: '100%' },
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '10px',
    marginBottom: '4px',
  },
  titleRow: { display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 },
  icon: { color: colors.accent, flexShrink: 0 },
  title: {
    fontFamily: fonts.display,
    fontSize: '22px',
    fontWeight: 530,
    letterSpacing: '-0.025em',
    lineHeight: 1.2,
    color: colors.ink,
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  meta: {
    fontFamily: fonts.sans,
    fontSize: '10.5px',
    color: colors.inkFaint,
    paddingLeft: '27px',
    marginBottom: '13px',
  },
  items: {
    display: 'flex',
    flexDirection: 'column',
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  item: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '10px',
    paddingBlock: '7px',
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
    fontFamily: fonts.sans,
    fontSize: '13px',
    lineHeight: 1.5,
    color: colors.inkSoft,
  },
  itemNumber: {
    width: '16px',
    flexShrink: 0,
    fontFamily: fonts.sans,
    fontSize: '9.5px',
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: colors.inkFaint,
    textAlign: 'right',
  },
  more: {
    fontFamily: fonts.sans,
    fontSize: '11px',
    color: colors.inkFaint,
    paddingTop: '9px',
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    marginTop: 'auto',
    paddingTop: '14px',
  },
  count: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '3px 8px',
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSunken,
    fontFamily: fonts.sans,
    fontSize: '10.5px',
    fontWeight: 600,
    color: colors.inkMuted,
  },
  copied: { color: colors.olive },
});

export function ListsPage() {
  const lists = useLists();
  const { nameFor } = usePeople();
  const [dialog, setDialog] = useState<{ list?: ListMessage } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function copyList(list: ListMessage) {
    try {
      await navigator.clipboard.writeText(`${list.title}\n\n${list.content.join('\n')}`);
      setCopiedId(list.id);
      window.setTimeout(
        () => setCopiedId((current) => (current === list.id ? null : current)),
        1800,
      );
      toast('List copied to the clipboard.', 'success');
    } catch {
      toast('Could not access the clipboard.', 'error');
    }
  }

  return (
    <div {...stylex.props(styles.page)}>
      <PageHeader
        eyebrow="Shared lists"
        title="All in one basket."
        description="The weekly shop, the packing list, the things to pick up on the way home. Kept together, shared with the house."
        actions={
          <Button icon={<Plus size={15} />} onClick={() => setDialog({})}>
            New list
          </Button>
        }
      />

      {lists.isPending ? (
        <PageSkeleton rows={3} />
      ) : lists.isError ? (
        <PageError error={lists.error} onRetry={() => lists.refetch()} />
      ) : (lists.data ?? []).length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No lists yet"
          description="Start with the weekly shop, or the camping kit that always forgets one thing."
          action={
            <Button
              variant="secondary"
              size="sm"
              icon={<Plus size={14} />}
              onClick={() => setDialog({})}
            >
              Start a list
            </Button>
          }
        />
      ) : (
        <div
          {...stylex.props(styles.scroller)}
          role="region"
          aria-label="Shared lists, scroll horizontally for more"
          tabIndex={0}
        >
          {(lists.data ?? []).map((list) => {
            const created = toDate(list.createdAt);
            const updated = toDate(list.updatedAt);
            const author = nameFor(list.createdBy);
            return (
              <article key={list.id} {...stylex.props(styles.card)}>
                <div {...stylex.props(styles.header)}>
                  <div {...stylex.props(styles.titleRow)}>
                    <span {...stylex.props(styles.icon)}>
                      <ListChecks size={17} strokeWidth={1.8} />
                    </span>
                    <h2 {...stylex.props(styles.title)}>{list.title || 'Untitled list'}</h2>
                  </div>
                  <IconButton
                    label={`Edit ${list.title}`}
                    size="sm"
                    onClick={() => setDialog({ list })}
                  >
                    <Pencil size={14} />
                  </IconButton>
                </div>
                <span {...stylex.props(styles.meta)}>
                  {author ? `${author} · ` : ''}
                  {updated
                    ? `updated ${formatRelative(updated)}`
                    : created
                      ? `created ${formatRelative(created)}`
                      : 'shared with the house'}
                </span>

                <ol {...stylex.props(styles.items)}>
                  {list.content.slice(0, 8).map((item, index) => (
                    <li key={`${item}-${index}`} {...stylex.props(styles.item)}>
                      <span {...stylex.props(styles.itemNumber)}>{index + 1}</span>
                      <Markdown inline>{item}</Markdown>
                    </li>
                  ))}
                </ol>
                {list.content.length > 8 && (
                  <span {...stylex.props(styles.more)}>and {list.content.length - 8} more</span>
                )}

                <div {...stylex.props(styles.footer)}>
                  <span {...stylex.props(styles.count, copiedId === list.id && styles.copied)}>
                    {copiedId === list.id ? <Check size={11} /> : <ListChecks size={11} />}
                    {copiedId === list.id ? 'Copied' : plural(list.content.length, 'item')}
                  </span>
                  <IconButton label={`Copy ${list.title}`} size="sm" onClick={() => copyList(list)}>
                    <Copy size={14} />
                  </IconButton>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {dialog && <ListDialog list={dialog.list} onClose={() => setDialog(null)} />}
    </div>
  );
}
