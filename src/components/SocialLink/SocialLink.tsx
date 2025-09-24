import React from "react";
import Link from "next/link";
import cx from "classnames";

import styles from "./SocialLink.module.scss";

export type Props<E = HTMLUListElement> = React.DetailsHTMLAttributes<E>;

export const SocialLink = ({ className, ...props }: Props) => (
  <ul className={cx(styles.links, className)} {...props}>
    <li>
      <Link href="/posts">Posts</Link>
    </li>
    <li>
      <a href="https://github.com/minjun0219">Github</a>
    </li>
    <li>
      <a href="https://www.linkedin.com/in/minjun0219">Linkedin</a>
    </li>
    <li>
      <a href="https://instagram.com/3600s">Instagram</a>
    </li>
    <li>
      <a href="mailto:hi@minjun.kim">
        Mail to<span>hi@minjun.kim</span>
      </a>
    </li>
  </ul>
);

export default SocialLink;
