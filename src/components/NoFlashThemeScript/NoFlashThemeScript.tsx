import React from "react";

const storageKey = "theme";
const noFlash = `(function() {
function setDataThemeAttribute(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

function getPreferredTheme() {
  var theme = null;
  try {
    theme = localStorage.getItem('${storageKey}');
  } catch (err) {}
  return theme;
}

var lightQuery = window.matchMedia('(prefers-color-scheme: light)');
var preferredTheme = getPreferredTheme();
if (preferredTheme !== null) {
  setDataThemeAttribute(preferredTheme);
} else if (lightQuery.matches) {
  setDataThemeAttribute('light');
}
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
