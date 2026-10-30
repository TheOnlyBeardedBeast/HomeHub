import * as stylex from '@stylexjs/stylex';
import { Card } from '../../components/ui/Card';
import { CategoryDot } from '../../components/ui/CategoryChip';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { sidebarStyles as styles } from './calendarSidebarStyles';

export function CalendarLegend() {
  return (
    <Card padding="md">
      <SectionHeader title="How to read it" />
      <p {...stylex.props(styles.sideEmpty)}>
        Each dot is a category — family, work, school, health, social. Repeating events show up on
        every day they fall, and you can skip a single day without touching the series.
      </p>
      <div {...stylex.props(styles.legend)}>
        {['family', 'work', 'school', 'health', 'social'].map((category) => (
          <span key={category} {...stylex.props(styles.legendItem)}>
            <CategoryDot category={category} />
            {category[0].toUpperCase() + category.slice(1)}
          </span>
        ))}
      </div>
    </Card>
  );
}
