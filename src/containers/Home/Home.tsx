import Logo from '@/components/Logo';
import SocialLink from '@/components/SocialLink';
import { css } from '@/lib/css';
import type { Lang } from '@/lib/i18n';

const styles = {
  spaced: css`
    margin: 20px;
  `,
};

/** 홈은 헤더/푸터 없이 로고와 링크만 둔다(기존 구성 그대로). */
const Home = ({ lang = 'ko' }: { lang?: Lang }) => (
  <>
    <Logo className={styles.spaced} />
    <SocialLink className={styles.spaced} lang={lang} />
  </>
);

export default Home;
