import * as stylex from '@stylexjs/stylex';
import { AlertTriangle } from 'lucide-react';
import { colors, fonts, radius, space } from '../../styles/tokens.stylex';
import { Button } from './Button';

const styles = stylex.create({
  notice: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    paddingBlock: '11px',
    paddingInline: '12px',
    borderRadius: radius.md,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.amber,
    backgroundColor: colors.amberSoft,
    color: colors.amberInk,
    fontFamily: fonts.sans,
    fontSize: '12.5px',
    lineHeight: 1.45,
    marginBottom: space.s4,
  },
  message: { display: 'flex', alignItems: 'flex-start', gap: '8px' },
  actions: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
});

export function ConflictNotice({
  message,
  busy,
  onOverwrite,
  onDiscard,
}: {
  message: string;
  busy: boolean;
  onOverwrite: () => void;
  onDiscard: () => void;
}) {
  return (
    <div {...stylex.props(styles.notice)} role="alert">
      <span {...stylex.props(styles.message)}>
        <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
        {message}
      </span>
      <div {...stylex.props(styles.actions)}>
        <Button size="sm" variant="secondary" disabled={busy} onClick={onOverwrite}>
          Save mine anyway
        </Button>
        <Button size="sm" variant="ghost" disabled={busy} onClick={onDiscard}>
          Discard mine
        </Button>
      </div>
    </div>
  );
}
