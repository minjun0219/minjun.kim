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
