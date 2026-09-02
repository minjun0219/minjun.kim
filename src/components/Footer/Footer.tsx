import { type ClassName, css, cx } from "@/lib/css";

const root = css`
  margin-top: 3em;
  margin-bottom: 5em;
  text-align: center;
  color: var(--text-secondary-color);
`;

export type Props = {
  className?: ClassName;
};

export const Footer = ({ className }: Props) => {
  const date = new Date();
  return (
    <footer className={cx(root, className)}>
      <p>&copy; {date.getFullYear()} by minjun.kim</p>
    </footer>
  );
};

export default Footer;
