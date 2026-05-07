import PostExcerpt from "@/components/PostExcerpt";
import Wrapper from "@/components/Wrapper";

import styles from "./Posts.module.css";

const Posts = () => {
  return (
    <Wrapper>
      <PostExcerpt
        title="Next.js와 WordPress로 블로그 만들기"
        date="2020-05-24"
        url="/posts/next-js-wp-graphql-static-blog"
      />
      <PostExcerpt
        title="드디어 메인 홈 개편! 다시 시작!"
        date="2019-07-17"
        url="https://medium.com/wadiz/a69a5c032f1e"
        source="와디즈 서비스 (Medium)"
      />
      <PostExcerpt
        title="메이커 스튜디오 개편하기"
        date="2019-08-05"
        url="https://medium.com/wadiz/8a14dde78442"
        source="와디즈 서비스 (Medium)"
      />
      <PostExcerpt
        title="레거시 시스템 탈출과 React 도입기"
        date="2018-12-26"
        url="https://youtu.be/7Tk-dQVhk18"
        source="XEOpenSeminar (Youtube)"
      />
      <PostExcerpt
        title="플라바 클리퍼 제작 후기"
        date="2013-07-17"
        url="https://medium.com/@minjun.kim/3da4285f1a9"
        source="Medium"
      />
      <PostExcerpt
        title="Retina Display에서 1px을 1px로 보이게 하는 법"
        date="2013-04-16"
        url="https://medium.com/@minjun.kim/220c6280f395"
        source="Medium"
      />
      <PostExcerpt
        title="프론트엔드 개발, 그리고 웹 퍼블리싱"
        date="2011-06-11"
        url="https://medium.com/@minjun.kim/b3333eee0888"
        source="Medium"
      />
      <PostExcerpt
        title="Mac OS X Lion에서 VoiceOver 사용하기"
        date="2011-06-03"
        url="https://medium.com/@minjun.kim/647c22f2cecd"
        source="Medium"
      />
      <footer className={styles.footer}>
        <a
          href="/feed.xml"
          className={styles.feedLink}
          aria-label="RSS 피드 구독"
        >
          <svg
            className={styles.feedIcon}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M6.18 15.64a2.18 2.18 0 1 1 0 4.36 2.18 2.18 0 0 1 0-4.36zM4 4.44A19.56 19.56 0 0 1 19.56 20h-2.83A16.73 16.73 0 0 0 4 7.27V4.44zm0 5.66a13.9 13.9 0 0 1 9.9 9.9h-2.83A11.07 11.07 0 0 0 4 12.93V10.1z" />
          </svg>
          Feed
        </a>
      </footer>
    </Wrapper>
  );
};

export default Posts;
