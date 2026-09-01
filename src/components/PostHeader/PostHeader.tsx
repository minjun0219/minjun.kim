import cx from "classnames";
import type { Child } from "hono/jsx";
import { isInternalHref } from "@/lib/htmx";

import styles from "./PostHeader.module.css";

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

const ExternalLinkIcon = ({ className }: { className?: string }) => (
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
  className?: string;
  source?: string;
  mediumUrl?: string;
  compact?: boolean;
};

const PostHeader = ({
  title,
  date,
  url,
  source,
  mediumUrl,
  className,
  compact,
}: Props) => {
  const created = new Intl.DateTimeFormat("ko-KR", { timeZone: "UTC" }).format(
    new Date(date),
  );

  return (
    <div className={cx(styles.header, className)}>
      <div className={cx(styles.title, compact && styles.compact)}>
        {url ? (
          <h1>
            <PostLink href={url}>{title}</PostLink>
          </h1>
        ) : (
          <h1>{title}</h1>
        )}
      </div>
      <div className={styles.info}>
        <span>{created}</span>
        {source ? (
          <>
            {" "}
            • <span>{source}</span>
          </>
        ) : null}
      </div>
      {mediumUrl ? (
        <a
          className={styles.mediumLink}
          href={mediumUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Medium에서 보기
          <ExternalLinkIcon className={styles.mediumLinkIcon} />
        </a>
      ) : null}
    </div>
  );
};

export default PostHeader;
