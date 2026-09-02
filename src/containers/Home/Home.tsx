import Logo from '@/components/Logo';
import SocialLink from '@/components/SocialLink';
import { css } from '@/lib/css';

const styles = {
  spaced: css`
    margin: 20px;
  `,
};

/** 홈은 헤더/푸터 없이 로고와 링크만 둔다(기존 구성 그대로). */
const Home = () => (
  <>
    <Logo className={styles.spaced} />
    <SocialLink className={styles.spaced} />
  </>
);

export default Home;
