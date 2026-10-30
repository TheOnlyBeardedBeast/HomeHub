import * as stylex from '@stylexjs/stylex';
import { categoryKey, categoryLabel, type CategoryKey } from '../../lib/categories';
import { colors, fonts, radius } from '../../styles/tokens.stylex';

const styles = stylex.create({
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    paddingBlock: '4px',
    paddingInline: '9px',
    borderRadius: radius.pill,
    fontFamily: fonts.sans,
    fontSize: '11.5px',
    fontWeight: 580,
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
    backgroundColor: colors.surfaceSunken,
    color: colors.inkSoft,
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: radius.pill,
    flexShrink: 0,
  },
  family: { backgroundColor: colors.accentSoft, color: colors.accentInk },
  work: { backgroundColor: colors.skySoft, color: colors.skyInk },
  school: { backgroundColor: colors.oliveSoft, color: colors.oliveInk },
  health: { backgroundColor: colors.amberSoft, color: colors.amberInk },
  social: { backgroundColor: colors.plumSoft, color: colors.plumInk },
  other: { backgroundColor: colors.surfaceSunken, color: colors.inkSoft },
  familyDot: { backgroundColor: colors.accent },
  workDot: { backgroundColor: colors.sky },
  schoolDot: { backgroundColor: colors.olive },
  healthDot: { backgroundColor: colors.amber },
  socialDot: { backgroundColor: colors.plum },
  otherDot: { backgroundColor: colors.inkFaint },
});

const toneStyles: Record<CategoryKey, stylex.StyleXStyles> = {
  family: styles.family,
  work: styles.work,
  school: styles.school,
  health: styles.health,
  social: styles.social,
  other: styles.other,
};

const dotStyles: Record<CategoryKey, stylex.StyleXStyles> = {
  family: styles.familyDot,
  work: styles.workDot,
  school: styles.schoolDot,
  health: styles.healthDot,
  social: styles.socialDot,
  other: styles.otherDot,
};

export function CategoryChip({ category }: { category: string }) {
  const key = categoryKey(category);
  return (
    <span {...stylex.props(styles.chip, toneStyles[key])}>
      <span {...stylex.props(styles.dot, dotStyles[key])} />
      {categoryLabel(category)}
    </span>
  );
}

export function CategoryDot({ category }: { category: string }) {
  return <span {...stylex.props(styles.dot, dotStyles[categoryKey(category)])} />;
}
