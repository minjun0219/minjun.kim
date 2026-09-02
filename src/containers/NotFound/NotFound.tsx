import Wrapper from '@/components/Wrapper';
import { css } from '@/lib/css';

const container = css`
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: calc(100vh - 14rem);
  padding-top: 3em;
  padding-bottom: 3em;
  font-family: var(--font-family-base);
  color: var(--text-color);
`;

const code = css`
  margin: 0 0 0.75em;
  font-size: 0.8rem;
  letter-spacing: 0.15em;
  color: var(--text-secondary-color);
`;

const title = css`
  margin: 0;
  font-size: 1.6rem;
  font-weight: 800;
  line-height: 1.4;
  word-break: keep-all;
`;

const description = css`
  margin: 0.75em 0 2em;
  color: var(--text-secondary-color);
  word-break: keep-all;
`;

const home = css`
  &:link,
  &:visited {
    color: var(--text-secondary-color);
    text-decoration: none;
    transition: color 0.3s;
  }

  &:hover,
  &:focus {
    color: var(--text-color);
    text-decoration: underline;
  }
`;

const NotFound = () => (
  <Wrapper className={container}>
    <p className={code}>404</p>
    <h1 className={title}>페이지를 찾을 수 없습니다</h1>
    <p className={description}>요청하신 페이지가 이동되었거나 더 이상 존재하지 않습니다.</p>
    <a href="/" className={home}>
      ← 홈으로 돌아가기
    </a>
  </Wrapper>
);

export default NotFound;
