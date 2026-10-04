export const SITE_URL = (process.env.HOMEPAGE ?? 'https://minjun.kim').replace(/\/$/, '');

export const SITE_NAME = 'minjun.kim';

export const SITE_DESCRIPTION =
  '민준의 개발 블로그 — 웹, 프론트엔드, 그리고 만든 것들에 대한 기록.';

export const AUTHOR_NAME = 'Minjun Kim';

export const AUTHOR_EMAIL = 'hi@minjun.kim';

export const LOCALE = 'ko_KR';

export const DEFAULT_OG_IMAGE = '/og.png';

/** 구조화 데이터(JSON-LD)·llms.txt 에 쓰는 실명 표기 */
export const AUTHOR_NAME_KO = '김민준';

export const AUTHOR_JOB_TITLE = 'Frontend Engineer';

/** 같은 사람의 외부 프로필 — JSON-LD `Person.sameAs` */
export const AUTHOR_PROFILES = [
  { name: 'GitHub', url: 'https://github.com/minjun0219' },
  { name: 'LinkedIn', url: 'https://www.linkedin.com/in/minjun0219' },
];

/**
 * 이 도메인의 최상위 경로 중 **다른 Worker 가 서빙하는** 앱. 각 앱 Worker 가 `minjun.kim/<이름>*`
 * zone route 를 걸고, route 는 이 사이트(Custom Domain = origin)보다 먼저 실행되므로 요청이 여기까지
 * 오지 않는다. 그래서 이 이름으로 페이지를 만들면 안 되고(배포돼도 보이지 않는다), 이 경로로 가는
 * 링크는 hx-boost 하면 안 된다 — 다른 앱의 HTML 이 이 사이트 body 에 스왑된다.
 */
export const APP_PATHS = ['/mdwire', '/ogpeek'] as const;
