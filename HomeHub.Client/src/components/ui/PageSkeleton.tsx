import * as stylex from '@stylexjs/stylex';
import { Skeleton } from './Skeleton';

const styles = stylex.create({
  loadingPage: { display: 'flex', flexDirection: 'column', gap: '14px' },
});

export function PageSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div {...stylex.props(styles.loadingPage)}>
      <Skeleton width="32%" height={40} />
      <Skeleton width="55%" height={16} />
      <div style={{ height: 12 }} />
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} height={76} />
      ))}
    </div>
  );
}
