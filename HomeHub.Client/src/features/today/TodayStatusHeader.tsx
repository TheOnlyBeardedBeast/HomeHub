import { PageHeader } from '../../components/ui/PageHeader';
import { formatLongDate } from '../../lib/format';
import { todayTitle } from './todayData';

export function TodayStatusHeader({ now, firstName }: { now: Date; firstName?: string }) {
  return <PageHeader eyebrow={formatLongDate(now)} title={todayTitle(now, firstName)} />;
}
