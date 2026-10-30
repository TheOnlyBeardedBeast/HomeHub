import * as stylex from '@stylexjs/stylex';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';
import { colors, fonts, motion, radius, shadow } from '../../styles/tokens.stylex';

const styles = stylex.create({
  story: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 'clamp(30px, 5.4vw, 76px)',
    overflow: 'hidden',
    backgroundImage: `radial-gradient(circle at 12% 6%, rgba(201, 100, 66, 0.14), transparent 44%), radial-gradient(circle at 86% 90%, rgba(111, 125, 92, 0.16), transparent 46%)`,
    borderRightWidth: '1px',
    borderRightStyle: 'solid',
    borderRightColor: colors.border,
    '@media (max-width: 900px)': { display: 'none' },
  },
  brand: {
    animationName: 'homehub-fade-in',
    animationDuration: '600ms',
    animationFillMode: 'both',
  },
  storyBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    maxWidth: '560px',
    marginBlock: 'auto',
    paddingBlock: '48px',
    animationName: 'homehub-fade-up',
    animationDuration: '650ms',
    animationTimingFunction: motion.ease,
    animationFillMode: 'both',
  },
  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    fontFamily: fonts.sans,
    fontSize: '10.5px',
    fontWeight: 700,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: colors.accentInk,
  },
  headline: {
    fontFamily: fonts.display,
    fontSize: 'clamp(44px, 4.9vw, 68px)',
    fontWeight: 430,
    lineHeight: 0.99,
    letterSpacing: '-0.045em',
    color: colors.ink,
    margin: 0,
    textWrap: 'balance',
  },
  headlineAccent: { fontStyle: 'italic', color: colors.accentInk },
  lede: {
    fontFamily: fonts.sans,
    fontSize: '15.5px',
    lineHeight: 1.65,
    color: colors.inkMuted,
    margin: 0,
    maxWidth: '470px',
    textWrap: 'pretty',
  },
  preview: {
    width: 'min(420px, 100%)',
    marginTop: '18px',
    padding: '18px',
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceRaised,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.border,
    boxShadow: shadow.lifted,
    transform: 'rotate(-1.1deg)',
  },
  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '13px',
  },
  previewTitle: {
    fontFamily: fonts.display,
    fontSize: '17px',
    fontWeight: 560,
    letterSpacing: '-0.02em',
  },
  previewDate: {
    fontFamily: fonts.sans,
    fontSize: '10.5px',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: colors.inkFaint,
  },
  previewRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '11px',
    paddingBlock: '9px',
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
  },
  previewTime: {
    fontFamily: fonts.sans,
    fontSize: '10.5px',
    fontWeight: 600,
    color: colors.inkMuted,
    width: '54px',
    flexShrink: 0,
  },
  previewDot: {
    width: '7px',
    height: '7px',
    borderRadius: radius.pill,
    flexShrink: 0,
  },
  previewText: {
    fontFamily: fonts.sans,
    fontSize: '12.5px',
    fontWeight: 540,
    color: colors.inkSoft,
  },
  previewDone: { textDecoration: 'line-through', color: colors.inkFaint },
  storyFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: fonts.sans,
    fontSize: '11.5px',
    color: colors.inkMuted,
  },
});

export function LoginStory() {
  return (
    <section {...stylex.props(styles.story)}>
      <div {...stylex.props(styles.brand)}>
        <Logo size="lg" />
      </div>

      <div {...stylex.props(styles.storyBody)}>
        <span {...stylex.props(styles.eyebrow)}>
          <Sparkles size={13} />
          The household, considered
        </span>
        <h1 {...stylex.props(styles.headline)}>
          A calmer way to run the place you call{' '}
          <span {...stylex.props(styles.headlineAccent)}>home</span>.
        </h1>
        <p {...stylex.props(styles.lede)}>
          One shared rhythm for the calendar, the chores, the notes on the fridge, and the shopping
          list everyone forgets. Quietly in sync, for every screen in the house.
        </p>

        <div {...stylex.props(styles.preview)} aria-hidden="true">
          <div {...stylex.props(styles.previewHeader)}>
            <span {...stylex.props(styles.previewTitle)}>Today at home</span>
            <span {...stylex.props(styles.previewDate)}>Wednesday</span>
          </div>
          <div {...stylex.props(styles.previewRow)} style={{ borderTop: 'none' }}>
            <span {...stylex.props(styles.previewTime)}>07:45</span>
            <span {...stylex.props(styles.previewDot)} style={{ backgroundColor: colors.accent }} />
            <span {...stylex.props(styles.previewText)}>School drop-off</span>
          </div>
          <div {...stylex.props(styles.previewRow)}>
            <span {...stylex.props(styles.previewTime)}>18:30</span>
            <span {...stylex.props(styles.previewDot)} style={{ backgroundColor: colors.olive }} />
            <span {...stylex.props(styles.previewText)}>Family dinner</span>
          </div>
          <div {...stylex.props(styles.previewRow)}>
            <span {...stylex.props(styles.previewTime)}>Chore</span>
            <span {...stylex.props(styles.previewDot)} style={{ backgroundColor: colors.amber }} />
            <span {...stylex.props(styles.previewText, styles.previewDone)}>Water the plants</span>
          </div>
        </div>
      </div>

      <div {...stylex.props(styles.storyFooter)}>
        <ShieldCheck size={14} />
        Keys stay in this browser. Nothing leaves your home network.
      </div>
    </section>
  );
}
