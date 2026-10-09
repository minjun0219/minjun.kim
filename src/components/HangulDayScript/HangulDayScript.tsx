/**
 * 한글날(매년 10월 9일)에만 로고를 한글로 바꾼다. 정적 사이트라 빌드 날짜가 아니라 방문 시각으로
 * 판단해야 매년 다시 배포하지 않아도 된다. 날짜는 방문자 시간대가 아니라 한국 시간(UTC+9, 서머타임 없음)
 * 기준이다.
 *
 * pre-paint 로 `<html data-hangul-day>` 를 붙이면 `components/Logo` 의 CSS 가 한글 로고를 보인다.
 * 이 스크립트는 문서마다 한 번만 실행되므로(아래 `hx-preserve`) 탭을 열어 둔 채 날짜가 바뀌는 경우를 위해
 * 한국 시간 자정마다 다시 계산한다.
 *
 * `hx-preserve` 는 NoFlashThemeScript 와 같은 이유다 — 새 `<script>` 사본이 머지되면 다시 실행된다.
 */
const script = `(function() {
var DAY = 24 * 60 * 60 * 1000;
var KST_OFFSET = 9 * 60 * 60 * 1000;
function update() {
  var kst = new Date(Date.now() + KST_OFFSET);
  var isHangulDay = kst.getUTCMonth() === 9 && kst.getUTCDate() === 9;
  document.documentElement.toggleAttribute('data-hangul-day', isHangulDay);
  setTimeout(update, DAY - ((Date.now() + KST_OFFSET) % DAY));
}
update();
})();`.replace(/(\s{2}|\n)/g, '');

const HangulDayScript = () => (
  <script
    id="hangul-day-script"
    hx-preserve="true"
    dangerouslySetInnerHTML={{
      __html: script,
    }}
  />
);

export default HangulDayScript;
