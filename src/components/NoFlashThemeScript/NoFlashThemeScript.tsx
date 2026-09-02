import { THEME_STORAGE_KEY } from '@/lib/theme';

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
})();`.replace(/(\s{2}|\n)/g, '');

/**
 * pre-paint 로 저장된 테마를 `<html data-theme>` 에 싣는다.
 * `hx-preserve` — hx-head 가 head 를 머지할 때 기존 요소를 그대로 두고 새 사본을
 * 버리게 한다. 내용이 같아도 새 `<script>` 를 삽입하면 브라우저가 다시 실행한다.
 */
const NoFlashThemeScript = () => (
  <script
    id="no-flash-theme-script"
    hx-preserve="true"
    dangerouslySetInnerHTML={{
      __html: noFlash,
    }}
  />
);

export default NoFlashThemeScript;
