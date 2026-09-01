/**
 * 빌드 산출물 경로. Vite 가 파일명에 해시를 붙이므로 정적 생성 직전에
 * `build/ssg.mjs` 가 실제 파일명을 넣어준다.
 */
let stylesheetHref = "/assets/style.css";
let clientScriptSrc = "/assets/main.js";

export function setAssetPaths(paths: {
  stylesheetHref: string;
  clientScriptSrc: string;
}) {
  stylesheetHref = paths.stylesheetHref;
  clientScriptSrc = paths.clientScriptSrc;
}

export function getStylesheetHref() {
  return stylesheetHref;
}

export function getClientScriptSrc() {
  return clientScriptSrc;
}
