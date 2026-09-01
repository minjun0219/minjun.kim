import cx from "classnames";
import { renderPostHtml } from "@/lib/blog/markdown";
import codeStyles from "../CodeBlock/CodeBlock.module.css";

import styles from "./PostContent.module.css";

/**
 * 마크다운을 이 컴포넌트가 기대하는 HTML 로 변환한다.
 *
 * 클래스명 주입 때문에 변환이 CSS Modules 를 아는 쪽에 있어야 해서 여기서 내보낸다.
 * 컴포넌트 자체는 동기로 두고, 호출부(라우트)가 미리 변환해 `html` 로 넘긴다.
 */
export function renderContentHtml(markdown: string): Promise<string> {
  return renderPostHtml(markdown, {
    codeRoot: codeStyles.root,
    codeContainer: codeStyles.container,
    codeBody: codeStyles.code,
    figure: styles.figure,
    iconLink: styles.iconLink,
    icon: styles.icon,
  });
}

type Props = {
  html: string;
  className?: string;
};

const PostContent = ({ html, className }: Props) => {
  return (
    <div
      className={cx(styles.content, className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default PostContent;
