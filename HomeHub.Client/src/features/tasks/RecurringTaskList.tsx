import * as stylex from '@stylexjs/stylex';
import { Pencil, Plus, Repeat2, Trash2 } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Button, IconButton } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import type { RecurringTask } from '../../gen/tasks_pb';
import { describeRRule } from '../../lib/rrules';
import { colors, fonts, motion, radius } from '../../styles/tokens.stylex';

const styles = stylex.create({
  recurringRow: {
    display: 'grid',
    gridTemplateColumns: '34px 1fr auto',
    alignItems: 'start',
    gap: '11px',
    paddingBlock: '12px',
    paddingInline: '10px',
    marginInline: '-10px',
    borderRadius: radius.md,
    transitionProperty: 'background-color',
    transitionDuration: motion.fast,
    ':hover': { backgroundColor: colors.surfaceSunken },
  },
  repeatIcon: {
    display: 'grid',
    placeItems: 'center',
    width: '30px',
    height: '30px',
    borderRadius: radius.pill,
    backgroundColor: colors.accentWash,
    color: colors.accentInk,
  },
  recurringBody: { display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 },
  recurringTitle: {
    fontFamily: fonts.sans,
    fontSize: '13.5px',
    fontWeight: 570,
    letterSpacing: '-0.01em',
    color: colors.ink,
  },
  recurringMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap',
    fontFamily: fonts.sans,
    fontSize: '11px',
    color: colors.inkMuted,
  },
  recurringRule: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    color: colors.accentInk,
  },
  assignee: { display: 'inline-flex', alignItems: 'center', gap: '4px' },
  actions: { display: 'flex', gap: '1px' },
  divider: { height: '1px', backgroundColor: colors.border, marginBlock: '2px' },
});

export function RecurringTaskList({
  tasks,
  nameFor,
  onAdd,
  onEdit,
  onDelete,
}: {
  tasks: RecurringTask[];
  nameFor: (id?: string) => string | undefined;
  onAdd: () => void;
  onEdit: (task: RecurringTask) => void;
  onDelete: (task: RecurringTask) => void;
}) {
  return (
    <Card padding="sm">
      {tasks.length === 0 ? (
        <EmptyState
          icon={Repeat2}
          title="No repeating chores"
          description="Set up the things that come back every week — bins, plants, the dishwasher — and they will appear on their own."
          action={
            <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={onAdd}>
              Add a repeating task
            </Button>
          }
        />
      ) : (
        tasks.map((task, index) => (
          <div key={task.id}>
            {index > 0 && <div {...stylex.props(styles.divider)} />}
            <div {...stylex.props(styles.recurringRow)}>
              <span {...stylex.props(styles.repeatIcon)}>
                <Repeat2 size={15} />
              </span>
              <span {...stylex.props(styles.recurringBody)}>
                <span {...stylex.props(styles.recurringTitle)}>{task.title}</span>
                <span {...stylex.props(styles.recurringMeta)}>
                  <span {...stylex.props(styles.recurringRule)}>
                    <Repeat2 size={10} /> {describeRRule(task.rrule)}
                  </span>
                  {task.assignedTo && (
                    <span {...stylex.props(styles.assignee)}>
                      <Avatar name={nameFor(task.assignedTo) ?? 'Household member'} size="xs" />
                      {nameFor(task.assignedTo)}
                    </span>
                  )}
                  {task.description && <span>· {task.description}</span>}
                </span>
              </span>
              <span {...stylex.props(styles.actions)}>
                <IconButton label={`Edit ${task.title}`} size="sm" onClick={() => onEdit(task)}>
                  <Pencil size={13} />
                </IconButton>
                <IconButton label={`Delete ${task.title}`} size="sm" onClick={() => onDelete(task)}>
                  <Trash2 size={13} />
                </IconButton>
              </span>
            </div>
          </div>
        ))
      )}
    </Card>
  );
}
