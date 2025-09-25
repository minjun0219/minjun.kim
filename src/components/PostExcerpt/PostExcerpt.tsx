import React from "react";
import cx from "classnames";

import PostHeader from "../PostHeader";

import styles from "./PostExcerpt.module.css";

type Props = {
  title: string;
  date: string;
  excerpt?: string;
  url?: string;
  source?: string;
  className?: string;
};

const PostExcerpt = ({
  title,
  date,
  excerpt,
  url,
  source,
  className,
}: Props) => {
  return (
    <div className={cx(styles.excerpt, className)}>
      <PostHeader title={title} date={date} url={url} source={source} />
      {excerpt ? <div dangerouslySetInnerHTML={{ __html: excerpt }} /> : null}
    </div>
  );
};

export default PostExcerpt;
