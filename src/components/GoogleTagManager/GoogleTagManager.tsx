export type Props = {
  containerId: string;
};

export const GoogleTagManager = ({ containerId }: Props) => {
  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: GTM 부트스트랩 스크립트는 인라인 삽입이 공식 권장 방식
      dangerouslySetInnerHTML={{
        __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${containerId}');`.replace(
          /(\n|\s{2})/g,
          "",
        ),
      }}
    />
  );
};

export const GoogleTagManagerNoScript = ({ containerId }: Props) => {
  return (
    <noscript>
      {/* biome-ignore lint/a11y/useIframeTitle: GTM noscript iframe은 화면에 보이지 않으므로 title 불필요 */}
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${containerId}`}
        height="0"
        width="0"
        style={{
          display: "none",
          visibility: "hidden",
        }}
      />
    </noscript>
  );
};

export default GoogleTagManager;
