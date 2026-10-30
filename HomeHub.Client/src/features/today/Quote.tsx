import * as stylex from '@stylexjs/stylex';
import type { Quote as QuoteMessage } from '../../api/hooks/useQuote';
import { colors, fonts } from '../../styles/tokens.stylex';

const styles = stylex.create({
  quote: {
    maxWidth: '640px',
    margin: 0,
    paddingTop: '20px',
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
    // On short desktop windows the quote is the first thing to go so the
    // dashboard stays scroll-free.
    '@media (min-width: 901px) and (max-height: 820px)': { display: 'none' },
  },
  quoteInMain: { marginTop: 'auto' },
  quoteBelow: { gridArea: 'quote', maxWidth: 'none' },
  quoteText: {
    margin: 0,
    fontFamily: fonts.display,
    fontSize: '17px',
    fontStyle: 'italic',
    fontWeight: 420,
    lineHeight: 1.55,
    color: colors.inkSoft,
    textWrap: 'balance',
  },
  quoteAuthor: {
    marginTop: '10px',
    fontFamily: fonts.sans,
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: colors.inkFaint,
  },
});

export function Quote({ quote, simple }: { quote?: QuoteMessage | null; simple: boolean }) {
  if (!quote) return null;

  return (
    <figure {...stylex.props(styles.quote, simple ? styles.quoteBelow : styles.quoteInMain)}>
      <blockquote {...stylex.props(styles.quoteText)}>“{quote.text}”</blockquote>
      <figcaption {...stylex.props(styles.quoteAuthor)}>— {quote.author}</figcaption>
    </figure>
  );
}
