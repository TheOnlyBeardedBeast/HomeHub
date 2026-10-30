import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

const components: Components = {
  a: ({ children, href, title }) => (
    <a href={href} title={title} target="_blank" rel="noreferrer">
      {children}
    </a>
  ),
};

// List items are single-line, so drop the paragraph wrapper and keep the output inline.
const inlineComponents: Components = {
  ...components,
  p: ({ children }) => <span>{children}</span>,
};

/** Renders household content as GitHub-flavoured Markdown; raw HTML is not enabled. */
export function Markdown({ children, inline = false }: { children: string; inline?: boolean }) {
  const className = inline ? 'markdown markdown-inline' : 'markdown';
  const content = (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={inline ? inlineComponents : components}>
      {children}
    </ReactMarkdown>
  );

  return inline ? (
    <span className={className}>{content}</span>
  ) : (
    <div className={className}>{content}</div>
  );
}
