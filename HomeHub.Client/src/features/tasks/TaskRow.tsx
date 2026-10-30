import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';
import { useDeleteTask } from '../../api/hooks/useDeleteTask';
import type { TaskMessage } from '../../api/hooks/useTasks';
import { useToggleTask } from '../../api/hooks/useToggleTask';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { errorMessage } from '../../lib/errors';
import { formatRelative, toDate } from '../../lib/format';
import { toast } from '../../lib/toasts';
import { colors, fonts, motion, radius } from '../../styles/tokens.stylex';
import { TaskActions } from './TaskActions';
import { TaskCheckbox } from './TaskCheckbox';
import { TaskMeta } from './TaskMeta';

const styles = stylex.create({
  row: {
    display: 'grid',
    gridTemplateColumns: '24px 1fr auto',
    alignItems: 'start',
    gap: '11px',
    paddingBlock: '11px',
    paddingInline: '10px',
    marginInline: '-10px',
    borderRadius: radius.md,
    transitionProperty: 'background-color',
    transitionDuration: motion.fast,
    ':hover': { backgroundColor: colors.surfaceSunken },
  },
  body: { display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 },
  title: {
    fontFamily: fonts.sans,
    fontSize: '13.5px',
    fontWeight: 570,
    letterSpacing: '-0.01em',
    lineHeight: 1.35,
    color: colors.ink,
  },
  titleDone: { color: colors.inkFaint, textDecoration: 'line-through' },
  description: {
    fontFamily: fonts.sans,
    fontSize: '11.5px',
    lineHeight: 1.45,
    color: colors.inkMuted,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
});

export function TaskRow({
  task,
  assigneeName,
  onEdit,
}: {
  task: TaskMessage;
  assigneeName?: string;
  onEdit?: (task: TaskMessage) => void;
}) {
  const toggle = useToggleTask();
  const remove = useDeleteTask();
  const [confirming, setConfirming] = useState(false);
  const [failed, setFailed] = useState(false);
  const persisted = !task.recurringTaskId || task.done;
  const createdAt = toDate(task.createdAt);
  const doneAt =
    task.done && task.doneAt
      ? formatRelative(toDate(task.doneAt) ?? createdAt ?? new Date())
      : undefined;

  function handleToggle() {
    setFailed(false);
    toggle.mutate(task, {
      onError: (error) => {
        setFailed(true);
        toast(errorMessage(error), 'error');
      },
    });
  }

  return (
    <>
      <div {...stylex.props(styles.row)}>
        <TaskCheckbox
          title={task.title}
          done={task.done}
          pending={toggle.isPending}
          onToggle={handleToggle}
        />

        <div {...stylex.props(styles.body)}>
          <span {...stylex.props(styles.title, task.done && styles.titleDone)}>{task.title}</span>
          {task.description && (
            <span {...stylex.props(styles.description)}>{task.description}</span>
          )}
          <TaskMeta
            recurring={Boolean(task.recurringTaskId)}
            assigneeName={assigneeName}
            doneAt={doneAt}
            failed={failed}
          />
        </div>

        {persisted && (
          <TaskActions
            title={task.title}
            onEdit={onEdit ? () => onEdit(task) : undefined}
            onDelete={() => setConfirming(true)}
          />
        )}
      </div>

      <ConfirmDialog
        open={confirming}
        title="Delete this task?"
        description={`"${task.title}" will be removed for everyone in the household.`}
        busy={remove.isPending}
        onClose={() => setConfirming(false)}
        onConfirm={() => {
          remove.mutate(task.id, {
            onSuccess: () => {
              toast('Task deleted.', 'success');
              setConfirming(false);
            },
            onError: (error) => {
              setConfirming(false);
              toast(errorMessage(error), 'error');
            },
          });
        }}
      />
    </>
  );
}
