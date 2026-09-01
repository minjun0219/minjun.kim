/**
 * 다른 곳에 실린 글. `_posts` 에 원문이 없어 파일로 만들 수 없으므로 목록용 데이터로 둔다.
 * 목록에서는 내부 글과 날짜순으로 함께 정렬된다.
 */
export type ExternalPost = {
  title: string;
  date: string;
  url: string;
  /** 목록에서 제목 옆에 표기할 출처 */
  source: string;
};

export const EXTERNAL_POSTS: ExternalPost[] = [
  {
    title: "메이커 스튜디오 개편하기",
    date: "2019-08-05",
    url: "https://medium.com/wadiz/8a14dde78442",
    source: "와디즈 서비스 (Medium)",
  },
  {
    title: "드디어 메인 홈 개편! 다시 시작!",
    date: "2019-07-17",
    url: "https://medium.com/wadiz/a69a5c032f1e",
    source: "와디즈 서비스 (Medium)",
  },
  {
    title: "레거시 시스템 탈출과 React 도입기",
    date: "2018-12-26",
    url: "https://youtu.be/7Tk-dQVhk18",
    source: "XEOpenSeminar (Youtube)",
  },
];
