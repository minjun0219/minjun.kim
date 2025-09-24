import React, { useMemo } from "react";
import moment from "moment";
import Link from "next/link";

import styles from "./PostHeader.module.scss";

const PostLink = ({
  href,
  children,
}: React.PropsWithChildren<{ href: string }>) => {
  if (/^https?:\/\//i.test(href)) {
    <a href={href}>{children}</a>;
  }

  return <Link href={href}>{children}</Link>;
};

type Props = {
  url?: string;
  title: string;
  date: string;
  className?: string;
  source?: string;
};

const PostHeader = ({ title, date, url, source }: Props) => {
  const created = useMemo(() => moment(date).format("YYYY/MM/DD"), [date]);
  return (
    <div className={styles.header}>
      <div className={styles.title}>
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
    </div>
  );
};

export default PostHeader;
