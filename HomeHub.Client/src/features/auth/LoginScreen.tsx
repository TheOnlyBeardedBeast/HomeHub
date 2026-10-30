import * as stylex from '@stylexjs/stylex';
import { ThemeToggle } from '../../components/ThemeToggle';
import { colors } from '../../styles/tokens.stylex';
import { LoginCard } from './LoginCard';
import { LoginStory } from './LoginStory';

const styles = stylex.create({
  page: {
    minHeight: '100dvh',
    display: 'grid',
    gridTemplateColumns: '1.06fr 0.94fr',
    backgroundColor: colors.canvas,
    '@media (max-width: 900px)': { gridTemplateColumns: '1fr' },
  },
  themeToggle: { position: 'fixed', top: '18px', right: '18px', zIndex: 10 },
  panel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 24px',
    backgroundColor: colors.canvas,
    '@media (max-width: 900px)': {
      minHeight: '100dvh',
      padding: '26px 18px',
      backgroundImage: `radial-gradient(circle at 50% 0%, rgba(201, 100, 66, 0.12), transparent 48%)`,
    },
  },
});

export function LoginScreen() {
  return (
    <div {...stylex.props(styles.page)}>
      <div {...stylex.props(styles.themeToggle)}>
        <ThemeToggle variant="secondary" size="md" />
      </div>
      <LoginStory />
      <section {...stylex.props(styles.panel)}>
        <LoginCard />
      </section>
    </div>
  );
}
