/**
 * 한글날(매년 10월 9일)에만 로고를 한글로 바꾼다. 정적 사이트라 빌드 날짜가 아니라 방문 시각으로
 * 판단해야 매년 다시 배포하지 않아도 된다. 날짜는 방문자 시간대가 아니라 한국 시간(UTC+9, 서머타임 없음)
 * 기준이다.
 *
 * pre-paint 로 `<html data-hangul-day>` 를 붙이면 `components/Logo` 의 CSS 가 한글 로고를 보인다.
 * 이 스크립트는 문서마다 한 번만 실행되므로(아래 `hx-preserve`) 탭을 열어 둔 채 날짜가 바뀌는 경우를 위해
 * 한국 시간 자정마다 다시 계산한다. 로고 폰트 preload 도 한글날에만 넣는다 — 다른 날엔 한글 로고가
 * `display: none` 이라 폰트를 받지 않는다. 넣은 preload 는 hx-boost 이동 때 hx-head 가 지우지만 이미
 * 받은 뒤라 상관없다.
 *
 * `hx-preserve` 는 NoFlashThemeScript 와 같은 이유다 — 새 `<script>` 사본이 머지되면 다시 실행된다.
 */
const createScript = (fontSrc: string) =>
  `(function() {
var DAY = 24 * 60 * 60 * 1000;
var KST_OFFSET = 9 * 60 * 60 * 1000;
var preloaded = false;
function update() {
  var kst = new Date(Date.now() + KST_OFFSET);
  var isHangulDay = kst.getUTCMonth() === 9 && kst.getUTCDate() === 9;
  document.documentElement.toggleAttribute('data-hangul-day', isHangulDay);
  if (isHangulDay && !preloaded) {
    preloaded = true;
    var link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.href = '${fontSrc}';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }
  setTimeout(update, DAY - ((Date.now() + KST_OFFSET) % DAY));
}
update();
})();`.replace(/(\s{2}|\n)/g, '');

const HangulDayScript = ({ fontSrc }: { fontSrc: string }) => (
  <script
    id="hangul-day-script"
    hx-preserve="true"
    dangerouslySetInnerHTML={{
      __html: createScript(fontSrc),
    }}
  />
);

export default HangulDayScript;
