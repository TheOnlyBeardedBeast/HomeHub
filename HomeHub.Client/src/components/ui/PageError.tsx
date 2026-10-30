import * as stylex from '@stylexjs/stylex';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { errorMessage } from '../../lib/errors';
import { colors, fonts, radius } from '../../styles/tokens.stylex';
import { Button } from './Button';

const styles = stylex.create({
  errorCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '18px',
    borderRadius: radius.lg,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.dangerCardBorder,
    backgroundColor: colors.dangerSoft,
  },
  errorIcon: { color: colors.danger, flexShrink: 0 },
  errorBody: { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 },
  errorTitle: {
    fontFamily: fonts.sans,
    fontSize: '13px',
    fontWeight: 650,
    color: colors.danger,
    margin: 0,
  },
  errorText: {
    fontFamily: fonts.sans,
    fontSize: '12.5px',
    color: colors.inkSoft,
    margin: 0,
  },
});

export function PageError({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div {...stylex.props(styles.errorCard)} role="alert">
      <AlertTriangle size={20} {...stylex.props(styles.errorIcon)} />
      <div {...stylex.props(styles.errorBody)}>
        <p {...stylex.props(styles.errorTitle)}>We could not load this</p>
        <p {...stylex.props(styles.errorText)}>{errorMessage(error)}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" icon={<RefreshCw size={13} />} onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
