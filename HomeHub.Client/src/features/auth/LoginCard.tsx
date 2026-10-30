import * as stylex from '@stylexjs/stylex';
import { Logo } from '../../components/ui/Logo';
import { colors, fonts, motion, radius, shadow } from '../../styles/tokens.stylex';
import { LoginForm } from './LoginForm';
import { LoginHelp } from './LoginHelp';

const styles = stylex.create({
  card: {
    width: 'min(420px, 100%)',
    padding: 'clamp(26px, 4vw, 38px)',
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceRaised,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.border,
    boxShadow: shadow.lifted,
    animationName: 'homehub-fade-up',
    animationDuration: '520ms',
    animationTimingFunction: motion.ease,
    animationFillMode: 'both',
  },
  mobileBrand: {
    display: 'none',
    marginBottom: '26px',
    '@media (max-width: 900px)': { display: 'block' },
  },
  cardEyebrow: {
    fontFamily: fonts.sans,
    fontSize: '10.5px',
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: colors.accentInk,
    marginBottom: '9px',
    display: 'block',
  },
  cardTitle: {
    fontFamily: fonts.display,
    fontSize: '34px',
    fontWeight: 480,
    letterSpacing: '-0.035em',
    lineHeight: 1.05,
    margin: 0,
    color: colors.ink,
  },
  cardCopy: {
    fontFamily: fonts.sans,
    fontSize: '13px',
    lineHeight: 1.6,
    color: colors.inkMuted,
    margin: '9px 0 24px',
  },
});

export function LoginCard() {
  return (
    <div {...stylex.props(styles.card)}>
      <div {...stylex.props(styles.mobileBrand)}>
        <Logo />
      </div>
      <span {...stylex.props(styles.cardEyebrow)}>Private by design</span>
      <h2 {...stylex.props(styles.cardTitle)}>Welcome home.</h2>
      <p {...stylex.props(styles.cardCopy)}>
        Enter the API key issued for your household. Your key decides what you can see and change.
      </p>

      <LoginForm />

      <LoginHelp />
    </div>
  );
}
