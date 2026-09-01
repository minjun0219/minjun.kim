import Logo from "@/components/Logo";
import SocialLink from "@/components/SocialLink";

import styles from "./Home.module.css";

/** 홈은 헤더/푸터 없이 로고와 링크만 둔다(기존 구성 그대로). */
const Home = () => (
  <>
    <Logo className={styles.logo} />
    <SocialLink className={styles.social} />
  </>
);

export default Home;
