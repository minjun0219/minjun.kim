import React from "react";

import PostExcerpt from "@/components/PostExcerpt";
import Wrapper from "@/components/Wrapper";

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
    </Wrapper>
  );
};

export default Posts;
