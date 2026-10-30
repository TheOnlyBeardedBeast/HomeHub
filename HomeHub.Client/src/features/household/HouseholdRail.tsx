import * as stylex from '@stylexjs/stylex';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { colors, fonts, radius } from '../../styles/tokens.stylex';

const styles = stylex.create({
  railTitle: {
    fontFamily: fonts.display,
    fontSize: '18px',
    fontWeight: 540,
    letterSpacing: '-0.02em',
    color: colors.ink,
    margin: '0 0 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
  },
  steps: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  step: { display: 'flex', alignItems: 'flex-start', gap: '10px' },
  stepNumber: {
    display: 'grid',
    placeItems: 'center',
    width: '20px',
    height: '20px',
    flexShrink: 0,
    borderRadius: radius.pill,
    backgroundColor: colors.accentWash,
    color: colors.accentInk,
    fontFamily: fonts.sans,
    fontSize: '10px',
    fontWeight: 700,
    marginTop: '1px',
  },
  stepText: {
    fontFamily: fonts.sans,
    fontSize: '12px',
    lineHeight: 1.6,
    color: colors.inkMuted,
    margin: 0,
  },
  railCopy: {
    margin: 0,
    fontFamily: fonts.sans,
    fontSize: '12px',
    lineHeight: 1.6,
    color: colors.inkMuted,
  },
});

export function HouseholdRail() {
  return (
    <>
      <Card padding="md">
        <h3 {...stylex.props(styles.railTitle)}>
          <KeyRound size={16} color={colors.accent} /> How keys work
        </h3>
        <ol {...stylex.props(styles.steps)}>
          <li {...stylex.props(styles.step)}>
            <span {...stylex.props(styles.stepNumber)}>1</span>
            <p {...stylex.props(styles.stepText)}>
              The admin key is configured on the server. It can manage members, but it is not tied
              to a person.
            </p>
          </li>
          <li {...stylex.props(styles.step)}>
            <span {...stylex.props(styles.stepNumber)}>2</span>
            <p {...stylex.props(styles.stepText)}>
              Every key belongs to one person or one shared display. Activity carries that name
              automatically.
            </p>
          </li>
          <li {...stylex.props(styles.step)}>
            <span {...stylex.props(styles.stepNumber)}>3</span>
            <p {...stylex.props(styles.stepText)}>
              Keys are stored on the server only as a hash. If one is lost, delete the member and
              issue a fresh key.
            </p>
          </li>
          <li {...stylex.props(styles.step)}>
            <span {...stylex.props(styles.stepNumber)}>4</span>
            <p {...stylex.props(styles.stepText)}>
              Signing out clears the key from this browser only. Other devices keep their own.
            </p>
          </li>
        </ol>
      </Card>

      <Card padding="md">
        <h3 {...stylex.props(styles.railTitle)}>
          <ShieldCheck size={16} color={colors.olive} /> Keep it in the family
        </h3>
        <p {...stylex.props(styles.railCopy)}>
          HomeHub is meant for a trusted household network. Share keys privately, and avoid posting
          them in group chats or on a screen the whole neighbourhood can see.
        </p>
      </Card>
    </>
  );
}
