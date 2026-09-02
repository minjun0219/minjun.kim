import { MD_CLASS } from '@/lib/blog/markdownClassNames';
import { type ClassName, css, cx } from '@/lib/css';

const styles = {
  /**
   * 마크다운이 만든 raw HTML 의 스타일. hono/css 는 렌더된 값에만 클래스를 등록하므로
   * 본문 요소는 `MD_CLASS` 의 고정 클래스명을 루트에서 자손 셀렉터로 겨냥한다
   * (`markdown.ts` 의 rehype 가 같은 상수로 클래스를 박는다).
   */
  root: css`
    & blockquote {
      margin: 1em 0;
      padding-left: 1em;
      border-left: 4px solid var(--text-secondary-color);
    }

    & .${MD_CLASS.figure} {
      display: block;
      width: calc(100% + 2 * var(--page-margin));
      margin-left: calc(-1 * var(--page-margin));
      margin-right: calc(-1 * var(--page-margin));
      text-align: center;
    }

    & .${MD_CLASS.figure} img {
      display: inline-block;
      max-width: 100%;
      height: auto;
    }

    & .${MD_CLASS.iconLink} {
      display: inline-flex;
      align-items: center;
      vertical-align: middle;
      margin-left: 0.25em;
    }

    & .${MD_CLASS.icon} {
      width: 1em;
      height: 1em;
    }

    & .${MD_CLASS.code} {
      position: relative;
      background: #1a1f28;
      margin-left: calc(-1 * var(--page-margin));
      margin-right: calc(-1 * var(--page-margin));
      border-radius: 0;
      transition-property: border-radius;
      transition-duration: var(--transition-duration);
    }

    & .${MD_CLASS.code}[title]::before {
      display: block;
      padding-left: var(--page-margin);
      padding-right: var(--page-margin);
      font-family: var(--font-family-base);
      font-size: 0.8em;
      font-weight: bold;
      color: var(--code-title-color);
      content: attr(title);
    }

    & .${MD_CLASS.codeContainer} {
      position: relative;
      margin: 0;
      border-radius: 0;
      transition-property: border-radius;
      transition-duration: var(--transition-duration);
    }

    & .${MD_CLASS.codeContainer}[data-language]::after {
      content: attr(data-language);
      position: absolute;
      right: 0;
      top: 0;
      text-transform: uppercase;
      padding: 0.5em;
      line-height: 1;
      font-size: 0.5em;
      opacity: 0.4;
      font-family: var(--font-family-code);
    }

    & .${MD_CLASS.codeBody} {
      font-family: var(--font-family-code);
      padding: var(--page-margin);
      font-size: 0.7em;
      overflow-x: auto;
    }
  `,
};

type Props = {
  html: string;
  className?: ClassName;
};

const PostContent = ({ html, className }: Props) => {
  return <div className={cx(styles.root, className)} dangerouslySetInnerHTML={{ __html: html }} />;
};

export default PostContent;
