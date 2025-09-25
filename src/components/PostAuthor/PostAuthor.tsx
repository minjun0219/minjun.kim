import React from "react";

import styles from "./PostAuthor.module.css";

type Props = {
  className?: string;
  avatar?: string;
  name: string;
  description: string;
};

const PostAuthor = ({ avatar, name, description }: Props) => {
  return (
    <div className={styles.container}>
      <aside className={styles.author}>
        <span
          role="img"
          className={styles.avatar}
          style={{
            backgroundImage:
              typeof avatar === "string" ? `url(${avatar})` : undefined,
          }}
        />
        <div className={styles.description}>
          <p>
            <strong>{name}</strong>
          </p>
          <p>{description}</p>
        </div>
      </aside>
    </div>
  );
};

export default PostAuthor;
