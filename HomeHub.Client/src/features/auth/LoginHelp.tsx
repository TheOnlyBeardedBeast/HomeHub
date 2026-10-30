import * as stylex from '@stylexjs/stylex';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { colors, fonts, radius } from '../../styles/tokens.stylex';

const styles = stylex.create({
  divider: {
    height: '1px',
    backgroundColor: colors.border,
    marginBlock: '24px',
  },
  help: {
    display: 'flex',
    gap: '10px',
    padding: '13px',
    borderRadius: radius.md,
    backgroundColor: colors.canvas,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.border,
  },
  helpIcon: { color: colors.accentInk, flexShrink: 0, marginTop: 1 },
  helpTitle: {
    display: 'block',
    fontFamily: fonts.sans,
    fontSize: '11.5px',
    fontWeight: 650,
    color: colors.inkSoft,
    marginBottom: '2px',
  },
  helpText: {
    fontFamily: fonts.sans,
    fontSize: '11.5px',
    lineHeight: 1.55,
    color: colors.inkMuted,
    margin: 0,
  },
  code: {
    fontFamily: fonts.mono,
    fontSize: '10.5px',
    backgroundColor: colors.surfaceSunken,
    padding: '1px 4px',
    borderRadius: '4px',
  },
  footNote: {
    marginTop: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontFamily: fonts.sans,
    fontSize: '10.5px',
    color: colors.inkFaint,
  },
});

export function LoginHelp() {
  return (
    <>
      <div {...stylex.props(styles.divider)} />

      <div {...stylex.props(styles.help)}>
        <ShieldCheck size={16} {...stylex.props(styles.helpIcon)} />
        <div>
          <span {...stylex.props(styles.helpTitle)}>Where do I find my key?</span>
          <p {...stylex.props(styles.helpText)}>
            A household admin can create one under <strong>Members &amp; keys</strong>. Admins can
            also use the key configured as{' '}
            <code {...stylex.props(styles.code)}>Authentication__AdminApiKey</code>.
          </p>
        </div>
      </div>

      <div {...stylex.props(styles.footNote)}>
        <KeyRound size={11} />
        Stored only in this browser
      </div>
    </>
  );
}
