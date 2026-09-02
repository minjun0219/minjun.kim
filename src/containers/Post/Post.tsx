import PostArticle from '@/components/PostArticle';
import Wrapper from '@/components/Wrapper';
import { css } from '@/lib/css';

const root = css`
  margin: 3em auto 5em;
  color: var(--text-color);
`;

type Props = {
  title: string;
  date: string;
  html: string;
  mediumUrl?: string;
};

const Post = ({ title, html, date, mediumUrl }: Props) => {
  return (
    <Wrapper className={root}>
      <PostArticle title={title} html={html} date={date} mediumUrl={mediumUrl} />
    </Wrapper>
  );
};

export default Post;
