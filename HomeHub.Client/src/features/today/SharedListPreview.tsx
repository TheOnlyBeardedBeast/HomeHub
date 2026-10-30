import * as stylex from '@stylexjs/stylex';
import { Link } from '@tanstack/react-router';
import { ArrowRight, ListChecks } from 'lucide-react';
import type { ListMessage } from '../../api/hooks/useLists';
import { Card } from '../../components/ui/Card';
import { Markdown } from '../../components/ui/Markdown';
import { colors, fonts, radius } from '../../styles/tokens.stylex';
import { railStyles as styles } from './todayRailStyles';

const listStyles = stylex.create({
  listTitle: {
    fontFamily: fonts.display,
    fontSize: '19px',
    fontWeight: 540,
    letterSpacing: '-0.02em',
    color: colors.ink,
    margin: '0 0 10px',
  },
  listItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(5px, 0.7vh, 7px)',
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: fonts.sans,
    fontSize: '12.5px',
    color: colors.inkSoft,
  },
  bullet: {
    width: '5px',
    height: '5px',
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    flexShrink: 0,
  },
});

export function SharedListPreview({ list }: { list?: ListMessage }) {
  return (
    <section>
      <div {...stylex.props(styles.railHeading)}>
        <span {...stylex.props(styles.railTitle)}>
          <ListChecks size={13} /> Shared list
        </span>
        <Link to="/lists" {...stylex.props(styles.railLink)}>
          All lists <ArrowRight size={11} />
        </Link>
      </div>
      <Card padding="md">
        {list ? (
          <>
            <h3 {...stylex.props(listStyles.listTitle)}>{list.title}</h3>
            <ul {...stylex.props(listStyles.listItems)}>
              {list.content.slice(0, 5).map((item, index) => (
                <li key={`${item}-${index}`} {...stylex.props(listStyles.listItem)}>
                  <span {...stylex.props(listStyles.bullet)} />
                  <Markdown inline>{item}</Markdown>
                </li>
              ))}
            </ul>
            {list.content.length > 5 && (
              <p {...stylex.props(styles.railEmpty)} style={{ marginTop: 8 }}>
                +{list.content.length - 5} more
              </p>
            )}
          </>
        ) : (
          <p {...stylex.props(styles.railEmpty)}>
            No shared lists yet. Start one for the weekly shop or the next trip.
          </p>
        )}
      </Card>
    </section>
  );
}
