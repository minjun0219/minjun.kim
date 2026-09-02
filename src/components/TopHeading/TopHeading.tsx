import type { Child } from "hono/jsx";
import { type ClassName, css, cx } from "@/lib/css";

const root = css`
  color: var(--text-color);
  font-size: 3em;
  font-weight: normal;

  & span {
    color: var(--primary-color);
  }

  & a {
    text-decoration: none;
    color: inherit;
  }
`;

export type Props = {
  className?: ClassName;
  children?: Child;
};

const TopHeading = ({ children, className }: Props) => {
  return <h1 className={cx(root, className)}>{children}</h1>;
};

export default TopHeading;
