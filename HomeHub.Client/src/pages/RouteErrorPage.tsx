import * as stylex from '@stylexjs/stylex';
import { PageError } from '../components/ui/PageError';
import { errorMessage } from '../lib/errors';
import { colors, fonts } from '../styles/tokens.stylex';

const styles = stylex.create({
  errorTitle: {
    fontFamily: fonts.display,
    fontSize: '28px',
    fontWeight: 500,
    letterSpacing: '-0.03em',
    color: colors.ink,
    margin: '0 0 12px',
  },
  errorCopy: {
    fontFamily: fonts.sans,
    fontSize: '13px',
    color: colors.inkMuted,
    margin: '0 0 18px',
  },
});

export function RouteErrorPage({ error, reset }: { error: unknown; reset: () => void }) {
  return (
    <>
      <h1 {...stylex.props(styles.errorTitle)}>Something came loose</h1>
      <p {...stylex.props(styles.errorCopy)}>{errorMessage(error)}</p>
      <PageError error={error} onRetry={reset} />
    </>
  );
}
