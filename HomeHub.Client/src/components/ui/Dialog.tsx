import * as stylex from '@stylexjs/stylex';
import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { colors, fonts, motion, radius, shadow, space } from '../../styles/tokens.stylex';
import { IconButton } from './Button';

const styles = stylex.create({
  dialog: {
    width: 'min(560px, calc(100vw - 28px))',
    maxHeight: '88dvh',
    margin: 'auto',
    padding: 0,
    borderWidth: 0,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceRaised,
    color: colors.ink,
    boxShadow: shadow.dialog,
    overflow: 'hidden',
    animationName: 'homehub-dialog-in',
    animationDuration: '240ms',
    animationTimingFunction: motion.ease,
    animationFillMode: 'both',
  },
  sm: { width: 'min(440px, calc(100vw - 28px))' },
  lg: { width: 'min(720px, calc(100vw - 28px))' },
  panel: { display: 'flex', flexDirection: 'column', maxHeight: '88dvh' },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: space.s4,
    paddingTop: space.s6,
    paddingInline: space.s6,
    paddingBottom: space.s4,
  },
  heading: { display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 0 },
  title: {
    fontFamily: fonts.display,
    fontSize: '26px',
    fontWeight: 520,
    letterSpacing: '-0.025em',
    lineHeight: 1.12,
    color: colors.ink,
    margin: 0,
  },
  description: {
    fontFamily: fonts.sans,
    fontSize: '13px',
    lineHeight: 1.5,
    color: colors.inkMuted,
    margin: 0,
  },
  body: {
    paddingInline: space.s6,
    paddingBottom: space.s6,
    overflowY: 'auto',
    overscrollBehavior: 'contain',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '10px',
    paddingBlock: space.s4,
    paddingInline: space.s6,
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      {...stylex.props(styles.dialog, size === 'sm' && styles.sm, size === 'lg' && styles.lg)}
    >
      <div {...stylex.props(styles.panel)}>
        <div {...stylex.props(styles.header)}>
          <div {...stylex.props(styles.heading)}>
            <h2 id={titleId} {...stylex.props(styles.title)}>
              {title}
            </h2>
            {description && (
              <p id={descriptionId} {...stylex.props(styles.description)}>
                {description}
              </p>
            )}
          </div>
          <IconButton label="Close dialog" size="sm" onClick={onClose}>
            <X size={17} />
          </IconButton>
        </div>
        {children && <div {...stylex.props(styles.body)}>{children}</div>}
        {footer && <div {...stylex.props(styles.footer)}>{footer}</div>}
      </div>
    </dialog>
  );
}
