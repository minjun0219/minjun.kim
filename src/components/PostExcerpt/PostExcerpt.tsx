import { type ClassName, css, cx } from '@/lib/css';
import PostHeader from '../PostHeader';

const root = css`
  font-family: var(--font-family-base);
  font-size: 1rem;
  line-height: 1.8;
  color: var(--text-color);
  transition-property: color;
  transition-duration: var(--transition-duration);

  & a:link,
  & a:visited {
    color: inherit;
    text-decoration: underline;
    transition: color 0.3s;
  }

  & a:hover,
  & a:focus {
    color: var(--primary-color);
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

type Props = {
  title: string;
  date: string;
  excerpt?: string;
  url?: string;
  source?: string;
  mediumUrl?: string;
  className?: ClassName;
};

const PostExcerpt = ({ title, date, excerpt, url, source, mediumUrl, className }: Props) => {
  return (
    <div className={cx(root, className)}>
      <PostHeader
        title={title}
        date={date}
        url={url}
        source={source}
        mediumUrl={mediumUrl}
        compact
      />
      {excerpt ? <div dangerouslySetInnerHTML={{ __html: excerpt }} /> : null}
    </div>
  );
};

export default PostExcerpt;
