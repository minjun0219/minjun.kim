"use client";

import cx from "classnames";
import { Highlight, Prism, themes } from "prism-react-renderer";

import styles from "./CodeBlock.module.css";

type Props = {
  title?: string | null;
  className?: string;
  language: string;
  code: string;
};

const CodeBlock = ({ title, code, language }: Props) => {
  return (
    <Highlight
      prism={Prism}
      code={code}
      language={language}
      theme={themes.vsDark}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre title={title || undefined} className={cx(styles.root, className)}>
          <div
            data-language={language}
            className={styles.container}
            style={style}
          >
            <div className={styles.code}>
              {tokens.map((line, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: prism 토큰 배열은 정적이라 인덱스 키 안전
                <div {...getLineProps({ line, key: i })} key={i}>
                  {line.map((token, key) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: prism 토큰 배열은 정적이라 인덱스 키 안전
                    <span {...getTokenProps({ token, key })} key={key} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </pre>
      )}
    </Highlight>
  );
};

export default CodeBlock;
