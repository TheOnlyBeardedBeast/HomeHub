import * as stylex from '@stylexjs/stylex';
import { Link } from '@tanstack/react-router';
import { ArrowRight, CircleCheckBig, Plus } from 'lucide-react';
import type { TaskMessage } from '../../api/hooks/useTasks';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { TaskRow } from '../tasks/TaskRow';
import { colors, fonts, radius } from '../../styles/tokens.stylex';

const styles = stylex.create({
  openCount: {
    fontFamily: fonts.sans,
    fontSize: '11px',
    fontWeight: 620,
    color: colors.accentInk,
    backgroundColor: colors.accentWash,
    borderRadius: radius.pill,
    padding: '3px 9px',
  },
  doneLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 10px 4px',
    fontFamily: fonts.sans,
    fontSize: '11.5px',
    color: colors.inkMuted,
  },
  railLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    fontFamily: fonts.sans,
    fontSize: '11.5px',
    fontWeight: 560,
    color: colors.accentInk,
    ':hover': { color: colors.accent },
  },
});

export function ChoresCard({
  openTasks,
  doneTasks,
  nameFor,
  onEdit,
  onAdd,
  sectionSx,
  cardSx,
}: {
  openTasks: TaskMessage[];
  doneTasks: TaskMessage[];
  nameFor: (id?: string) => string | undefined;
  onEdit: (task: TaskMessage) => void;
  onAdd: () => void;
  sectionSx?: stylex.StyleXStyles;
  cardSx?: stylex.StyleXStyles;
}) {
  return (
    <section {...stylex.props(sectionSx)}>
      <SectionHeader
        title="Chores & to-dos"
        action={
          openTasks.length > 0 ? (
            <span {...stylex.props(styles.openCount)}>{openTasks.length} open</span>
          ) : (
            <Link to="/tasks" {...stylex.props(styles.railLink)}>
              All tasks <ArrowRight size={12} />
            </Link>
          )
        }
      />
      <Card padding="sm" sx={cardSx}>
        {openTasks.length === 0 && doneTasks.length === 0 ? (
          <EmptyState
            icon={CircleCheckBig}
            title="All clear"
            description="No chores waiting today. If something comes up, add it here."
            action={
              <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={onAdd}>
                Add a task
              </Button>
            }
          />
        ) : (
          <>
            {openTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                assigneeName={nameFor(task.assignedTo)}
                onEdit={!task.recurringTaskId || task.done ? onEdit : undefined}
              />
            ))}
            {doneTasks.length > 0 && (
              <>
                <div {...stylex.props(styles.doneLabel)}>
                  <span>Done today</span>
                </div>
                {doneTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    assigneeName={nameFor(task.assignedTo)}
                    onEdit={onEdit}
                  />
                ))}
              </>
            )}
          </>
        )}
      </Card>
    </section>
  );
}
