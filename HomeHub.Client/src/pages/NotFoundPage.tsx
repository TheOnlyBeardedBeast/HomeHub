import * as stylex from '@stylexjs/stylex';
import { Link } from '@tanstack/react-router';
import { Compass, Home } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { colors, fonts, motion } from '../styles/tokens.stylex';

const styles = stylex.create({
  homeLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    height: '40px',
    paddingInline: '16px',
    borderRadius: '12px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
    color: colors.ink,
    fontFamily: fonts.sans,
    fontSize: '14px',
    fontWeight: 560,
    transitionProperty: 'background-color, border-color',
    transitionDuration: motion.fast,
    ':hover': { backgroundColor: colors.surfaceSunken, borderColor: colors.borderStrong },
  },
});

export function NotFoundPage() {
  return (
    <EmptyState
      icon={Compass}
      title="This room is not in the house"
      description="The address does not exist, or the page has moved. Let us take you back to today."
      action={
        <Link to="/" {...stylex.props(styles.homeLink)}>
          <Home size={15} /> Back to today
        </Link>
      }
    />
  );
}
