import React from "react";
import cx from "classnames";
import Markdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import CodeBlock from "../CodeBlock";

import styles from "./PostContent.module.scss";

const MarkdownCode: Components["code"] = ({ children, className, node }) => {
  // https://github.com/remarkjs/react-markdown/issues/820#issuecomment-2108253421
  if (node?.position?.start.line === node?.position?.end.line) {
    return <code className={className}>{children}</code>;
  }

  const lang = /language-(\w+)/.exec(className || "")?.[1];
  if (typeof children === "string") {
    return (
      <CodeBlock
        language={lang || "text"}
        code={children.replace(/\n$/, "")}
        title={node?.data?.meta}
      />
    );
  }

  return null;
};

const MarkdownPre: Components["pre"] = ({ children, ...props }) => {
  if (
    React.isValidElement(children) &&
    (children.type === "code" || children.type === MarkdownCode)
  ) {
    return children;
  }
  return <pre {...props}>{children}</pre>;
};

type Props = {
  value: string;
  className?: string;
};

const PostContent = async ({ value, className }: Props) => {
  return (
    <div className={cx(styles.content, className)}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: MarkdownCode,
          pre: MarkdownPre,
        }}
      >
        {value}
      </Markdown>
    </div>
  );
};

export default React.memo(PostContent);
