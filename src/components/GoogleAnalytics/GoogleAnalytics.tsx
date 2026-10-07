/** GA4 측정 ID 형식. 인라인 스크립트에 그대로 박히므로 형식이 다르면 빌드를 죽인다. */
const MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]+$/;

/**
 * GA4(gtag.js). Google 이 안내하는 설치 코드를 그대로 `<head>` 에 싣는다.
 * `GA_MEASUREMENT_ID` 가 없으면 아무것도 내지 않는다.
 *
 * hx-boost 이동의 page_view 는 여기서 쏘지 않는다 — GA4 향상된 측정의 "브라우저 기록 이벤트
 * 기반 페이지 변경"(기본 켜짐)이 htmx 의 `pushState` 를 잡아 보낸다. hx-head 가 응답 head 를
 * `pushState` 보다 먼저 머지하므로 그 시점의 `document.title` 은 이미 새 페이지 것이다.
 * `send_page_view: false` 로도 이 경로는 꺼지지 않으므로 수동으로 더 쏘면 두 번 집계된다.
 *
 * 두 `<script>` 는 페이지마다 outerHTML 이 같아 hx-head 가 기존 요소를 그대로 둔다(재실행 없음).
 */
const GoogleAnalytics = () => {
  const measurementId = process.env.GA_MEASUREMENT_ID;
  if (!measurementId) {
    return null;
  }
  if (!MEASUREMENT_ID_PATTERN.test(measurementId)) {
    throw new Error(`GA_MEASUREMENT_ID 형식이 아니다(G-XXXXXXXXXX): ${measurementId}`);
  }

  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${measurementId}');`,
        }}
      />
    </>
  );
};

export default GoogleAnalytics;
