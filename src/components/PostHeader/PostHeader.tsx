import type { Child } from 'hono/jsx';
import { type ClassName, css, cx } from '@/lib/css';
import { isInternalHref } from '@/lib/htmx';

const root = css`
  margin: 3em 0 2em;
`;

const title = css`
  & > h1 {
    margin: 0;
    font-size: 2rem;
    font-weight: 800;
    line-height: 1.3em;
    word-break: keep-all;
  }

  & > h1 > a:link,
  & > h1 > a:visited {
    text-decoration: none;
    color: var(--primary-color);
  }

  & > h1 > a:focus,
  & > h1 > a:hover {
    text-decoration: underline;
  }
`;

// cx 병합에서 뒤에 오는 같은 셀렉터가 이긴다 — 목록에서만 제목을 줄인다.
const titleCompact = css`
  & > h1 {
    font-size: 1.6rem;
  }
`;

const info = css`
  font-size: 0.8em;
  color: var(--text-secondary-color);
`;

const mediumLink = css`
  display: inline-flex;
  align-items: center;
  gap: 0.3em;
  margin-top: 0.6em;
  font-size: 0.85em;
  color: var(--primary-color);
  text-decoration: none;
  transition: color 0.3s;

  &:hover,
  &:focus {
    text-decoration: underline;
  }
`;

const mediumLinkIcon = css`
  flex-shrink: 0;
`;

const PostLink = ({ href, children }: { href: string; children: Child }) => {
  if (!isInternalHref(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return <a href={href}>{children}</a>;
};

const ExternalLinkIcon = ({ className }: { className?: ClassName }) => (
  <svg
    className={className}
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

type Props = {
  url?: string;
  title: string;
  date: string;
  className?: ClassName;
  source?: string;
  mediumUrl?: string;
  compact?: boolean;
};

const PostHeader = ({
  title: heading,
  date,
  url,
  source,
  mediumUrl,
  className,
  compact,
}: Props) => {
  const created = new Intl.DateTimeFormat('ko-KR', { timeZone: 'UTC' }).format(new Date(date));

  return (
    <div className={cx(root, className)}>
      <div className={cx(title, compact && titleCompact)}>
        {url ? (
          <h1>
            <PostLink href={url}>{heading}</PostLink>
          </h1>
        ) : (
          <h1>{heading}</h1>
        )}
      </div>
      <div className={info}>
        <span>{created}</span>
        {source ? (
          <>
            {' '}
            • <span>{source}</span>
          </>
        ) : null}
      </div>
      {mediumUrl ? (
        <a className={mediumLink} href={mediumUrl} target="_blank" rel="noopener noreferrer">
          Medium에서 보기
          <ExternalLinkIcon className={mediumLinkIcon} />
        </a>
      ) : null}
    </div>
  );
};

export default PostHeader;
