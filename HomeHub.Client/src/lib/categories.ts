export const categories = [
  { value: 'family', label: 'Family' },
  { value: 'work', label: 'Work' },
  { value: 'school', label: 'School' },
  { value: 'health', label: 'Health' },
  { value: 'social', label: 'Social' },
  { value: 'other', label: 'Other' },
] as const;

export type CategoryKey = (typeof categories)[number]['value'];

const aliases: Record<string, CategoryKey> = {
  family: 'family',
  home: 'family',
  work: 'work',
  school: 'school',
  health: 'health',
  social: 'social',
  other: 'other',
};

export function categoryKey(value: string | undefined): CategoryKey {
  return aliases[(value ?? '').trim().toLowerCase()] ?? 'other';
}

export function categoryLabel(value: string | undefined): string {
  const key = categoryKey(value);
  return categories.find((category) => category.value === key)?.label ?? 'Other';
}
