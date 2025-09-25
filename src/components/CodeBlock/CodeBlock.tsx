"use client";

import React from "react";
import cx from "classnames";
import { Prism, Highlight, themes } from "prism-react-renderer";

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
                <div {...getLineProps({ line, key: i })} key={i}>
                  {line.map((token, key) => (
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
