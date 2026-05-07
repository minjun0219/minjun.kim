import { THEME_STORAGE_KEY } from "@/lib/theme";

const noFlash = `(function() {
function setDataThemeAttribute(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

function getPreferredTheme() {
  var theme = null;
  try {
    theme = localStorage.getItem('${THEME_STORAGE_KEY}');
  } catch (err) {
    theme = null;
  }
  return theme;
}

var preferredTheme = getPreferredTheme();
if (preferredTheme === 'light' || preferredTheme === 'dark') {
  setDataThemeAttribute(preferredTheme);
}
})();`.replace(/(\s{2}|\n)/g, "");

const NoFlashThemeScript = () => (
  <script
    id="no-flash-theme-script"
    // biome-ignore lint/security/noDangerouslySetInnerHtml: 테마 깜빡임 방지 스크립트는 hydration 전에 인라인 실행돼야 함
    dangerouslySetInnerHTML={{
      __html: noFlash,
    }}
  />
);

export default NoFlashThemeScript;
