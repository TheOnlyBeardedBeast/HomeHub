export interface TimelineItem<T> {
  item: T;
  /** Minutes from the start of the day. */
  start: number;
  /** Minutes from the start of the day. */
  end: number;
}

export interface PlacedTimelineItem<T> extends TimelineItem<T> {
  column: number;
  columns: number;
}

/**
 * Splits overlapping events into side-by-side columns without shrinking events
 * from separate clusters (a busy morning should not narrow an evening event).
 */
export function layoutOverlaps<T>(items: TimelineItem<T>[]): PlacedTimelineItem<T>[] {
  const sorted = [...items].sort((a, b) => a.start - b.start || b.end - a.end);
  const placed: PlacedTimelineItem<T>[] = [];
  let cluster: (TimelineItem<T> & { column: number })[] = [];
  let columnEnds: number[] = [];
  let clusterEnd = -Infinity;

  const flush = () => {
    if (cluster.length === 0) return;
    const columns = Math.max(...cluster.map((entry) => entry.column)) + 1;
    for (const entry of cluster) placed.push({ ...entry, columns });
    cluster = [];
    columnEnds = [];
    clusterEnd = -Infinity;
  };

  for (const item of sorted) {
    if (cluster.length > 0 && item.start >= clusterEnd) flush();

    let column = 0;
    while (column < columnEnds.length && columnEnds[column] > item.start) column++;
    columnEnds[column] = item.end;
    cluster.push({ ...item, column });
    clusterEnd = Math.max(clusterEnd, item.end);
  }

  flush();
  return placed;
}
