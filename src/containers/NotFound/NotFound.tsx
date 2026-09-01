import Wrapper from "@/components/Wrapper";

import styles from "./NotFound.module.css";

const NotFound = () => (
  <Wrapper className={styles.container}>
    <p className={styles.code}>404</p>
    <h1 className={styles.title}>페이지를 찾을 수 없습니다</h1>
    <p className={styles.description}>
      요청하신 페이지가 이동되었거나 더 이상 존재하지 않습니다.
    </p>
    <a href="/" className={styles.home}>
      ← 홈으로 돌아가기
    </a>
  </Wrapper>
);

export default NotFound;
