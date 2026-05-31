import type { Metadata } from "next";
import Link from "next/link";

import Layout from "@/components/Layout";
import Wrapper from "@/components/Wrapper";

import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "페이지를 찾을 수 없습니다 (404)",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <Layout>
      <Wrapper className={styles.container}>
        <p className={styles.code}>404</p>
        <h1 className={styles.title}>페이지를 찾을 수 없습니다</h1>
        <p className={styles.description}>
          요청하신 페이지가 이동되었거나 더 이상 존재하지 않습니다.
        </p>
        <Link href="/" className={styles.home}>
          ← 홈으로 돌아가기
        </Link>
      </Wrapper>
    </Layout>
  );
}
