import React from "react";

const storageKey = "theme";
const noFlash = `(function() {
var stored = null;
try {
  stored = localStorage.getItem('${storageKey}');
} catch (err) {}
var theme = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
document.documentElement.setAttribute('data-theme', theme);
})();`.replace(/(\s{2}|\n)/g, "");

const NoFlashThemeScript = () => (
  <script
    id="no-flash-theme-script"
    dangerouslySetInnerHTML={{
      __html: noFlash,
    }}
  />
);

export default NoFlashThemeScript;
