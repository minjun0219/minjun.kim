import cx from "classnames";
import { PRELOAD_ATTR } from "@/lib/htmx";

import styles from "./SocialLink.module.css";

export type Props = {
  className?: string;
};

export const SocialLink = ({ className }: Props) => (
  <ul className={cx(styles.links, className)}>
    <li>
      <a href="/resume" {...PRELOAD_ATTR}>
        Resume
      </a>
    </li>
    <li>
      <a href="/posts" {...PRELOAD_ATTR}>
        Posts
      </a>
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
