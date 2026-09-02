import { type ClassName, css, cx } from "@/lib/css";

const root = css`
  margin: 0;
  padding: 0;

  &::after {
    clear: both;
    display: block;
    content: "";
  }

  & li {
    list-style: none;
    float: left;
  }

  & li::after {
    content: "|";
    margin: 0 5px;
  }

  & li:last-child::after {
    content: none;
  }

  & span,
  & li::after {
    color: var(--text-secondary-color);
    opacity: 0.5;
  }

  & a:link,
  & a:visited {
    color: var(--text-secondary-color);
    text-decoration: none;
    transition: color 0.3s;
  }

  & a:hover,
  & a:focus {
    color: var(--text-color);
  }

  & a:active {
    text-decoration: underline;
  }

  & a > span {
    display: none;
  }

  & a > span::before {
    content: " ";
  }

  & a:hover > span,
  & a:focus > span {
    display: inline;
  }
`;

export type Props = {
  className?: ClassName;
};

export const SocialLink = ({ className }: Props) => (
  <ul className={cx(root, className)}>
    <li>
      <a href="/resume">Resume</a>
    </li>
    <li>
      <a href="/posts">Posts</a>
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
