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
        title="메이커 스튜디오 개편하기"
        date="2019-08-05"
        url="https://medium.com/wadiz/8a14dde78442"
        source="와디즈 서비스 (Medium)"
      />
      <PostExcerpt
        title="드디어 메인 홈 개편! 다시 시작!"
        date="2019-07-17"
        url="https://medium.com/wadiz/a69a5c032f1e"
        source="와디즈 서비스 (Medium)"
      />
      <PostExcerpt
        title="레거시 시스템 탈출과 React 도입기"
        date="2018-12-26"
        url="https://youtu.be/7Tk-dQVhk18"
        source="XEOpenSeminar (Youtube)"
      />
      <PostExcerpt
        title="WordPress XML-RPC 오류 관련"
        date="2015-11-17"
        url="/posts/wordpress-xml-rpc-error"
      />
      <PostExcerpt
        title="플라바 클리퍼 제작 후기"
        date="2013-07-17"
        url="/posts/flava-clipper-postmortem"
        mediumUrl="https://medium.com/@minjun.kim/3da4285f1a9"
      />
      <PostExcerpt
        title="Retina Display에서 1px을 1px로 보이게 하는 법"
        date="2013-04-16"
        url="/posts/1px-on-retina-display"
        mediumUrl="https://medium.com/@minjun.kim/220c6280f395"
      />
      <PostExcerpt
        title="IE10에서 Input Box, Clear 버튼 삭제하기"
        date="2012-12-17"
        url="/posts/ie10-input-clear-button"
      />
      <PostExcerpt
        title="PHP에서 Session 오류 시 해결 방법"
        date="2012-11-06"
        url="/posts/php-session-error-fix"
      />
      <PostExcerpt
        title="AppleGothic과 Apple SD Neo Gothic"
        date="2012-03-28"
        url="/posts/applegothic-and-apple-sd-neo-gothic"
      />
      <PostExcerpt
        title="PDF를 Load한 이후 발생되는 Mobile Safari 버그"
        date="2012-03-08"
        url="/posts/mobile-safari-pdf-security-bug"
      />
      <PostExcerpt
        title="jQuery로 Key Visual 만들기"
        date="2011-09-09"
        url="/posts/jquery-key-visual"
      />
      <PostExcerpt
        title="프론트엔드 개발, 그리고 웹 퍼블리싱"
        date="2011-06-03"
        url="/posts/frontend-development-and-web-publishing"
        mediumUrl="https://medium.com/@minjun.kim/b3333eee0888"
      />
      <PostExcerpt
        title="jQuery로 Flash인척 내비게이션 만들기"
        date="2011-06-03"
        url="/posts/jquery-flash-like-navigation"
      />
      <PostExcerpt
        title="Mac OS X Lion에서 VoiceOver 사용하기"
        date="2011-06-03"
        url="/posts/voiceover-on-mac-os-x-lion"
        mediumUrl="https://medium.com/@minjun.kim/647c22f2cecd"
      />
      <footer className={styles.footer}>
        <a
          href="/posts/feed.xml"
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
