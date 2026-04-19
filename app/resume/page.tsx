import React from "react";
import type { Metadata } from "next";

import PostContent from "@/components/PostContent";
import Wrapper from "@/components/Wrapper";
import { getResume } from "@/lib/resume";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "이력서 | minjun.kim",
  description: "김민준 이력서",
  openGraph: {
    title: "이력서 | minjun.kim",
  },
};

export default async function ResumePage() {
  const { content, updatedAt } = getResume();

  return (
    <Wrapper className={styles.resume}>
      <article className={styles.article}>
        <PostContent value={content} className={styles.content} />
        {updatedAt && (
          <p className={styles.updatedAt}>마지막 업데이트: {updatedAt}</p>
        )}
      </article>
    </Wrapper>
  );
}
