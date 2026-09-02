import type { Child } from 'hono/jsx';
import { type ClassName, css, cx } from '@/lib/css';

const styles = {
  root: css`
    margin: 0 auto;
    padding-left: var(--page-margin);
    padding-right: var(--page-margin);
    max-width: var(--page-max-width);
    box-sizing: content-box;
  `,
};

export type Props = {
  children: Child;
  className?: ClassName;
};

export const Wrapper = ({ children, className }: Props) => {
  return <div className={cx(styles.root, className)}>{children}</div>;
};

export default Wrapper;
