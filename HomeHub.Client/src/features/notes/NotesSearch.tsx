import * as stylex from '@stylexjs/stylex';
import { Search, X } from 'lucide-react';
import { IconButton } from '../../components/ui/Button';
import { colors, fonts, motion, radius, shadow } from '../../styles/tokens.stylex';

const styles = stylex.create({
  searchRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    flexWrap: 'wrap',
    marginBottom: '20px',
  },
  searchWrap: { position: 'relative', width: 'min(380px, 100%)' },
  searchIcon: {
    position: 'absolute',
    left: '13px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: colors.inkFaint,
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    height: '42px',
    paddingLeft: '38px',
    paddingRight: '38px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceRaised,
    fontFamily: fonts.sans,
    fontSize: '13.5px',
    color: colors.ink,
    transitionProperty: 'border-color, box-shadow',
    transitionDuration: motion.fast,
    '::placeholder': { color: colors.inkFaint },
    '::-webkit-search-cancel-button': { display: 'none' },
    ':focus': { outline: 'none', borderColor: colors.accent },
    ':focus-visible': {
      borderColor: colors.accent,
      boxShadow: shadow.ring,
    },
  },
  clear: { position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)' },
  count: { fontFamily: fonts.sans, fontSize: '12.5px', color: colors.inkMuted },
});

export function NotesSearch({
  search,
  query,
  resultCount,
  onSearchChange,
  onClear,
}: {
  search: string;
  query?: string;
  resultCount?: number;
  onSearchChange: (search: string) => void;
  onClear: () => void;
}) {
  return (
    <div {...stylex.props(styles.searchRow)}>
      <div {...stylex.props(styles.searchWrap)}>
        <span {...stylex.props(styles.searchIcon)}>
          <Search size={15} />
        </span>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search the fridge door…"
          aria-label="Search notes"
          {...stylex.props(styles.searchInput)}
        />
        {search && (
          <span {...stylex.props(styles.clear)}>
            <IconButton label="Clear search" size="sm" onClick={onClear}>
              <X size={14} />
            </IconButton>
          </span>
        )}
      </div>
      {resultCount !== undefined && (
        <span {...stylex.props(styles.count)}>
          {resultCount === 1 ? '1 note' : `${resultCount} notes`} for “{query}”
        </span>
      )}
    </div>
  );
}
