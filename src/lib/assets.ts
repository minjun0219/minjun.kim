/**
 * 빌드 산출물 경로. Vite 가 파일명에 해시를 붙이고 vendor 파일에는 버전을 박으므로
 * 정적 생성 직전에 `scripts/ssg.mjs` 가 실제 파일명을 넣어준다.
 */
let stylesheetHref = "/assets/style.css";
let clientScriptSrc = "/assets/main.js";
let vendorScriptSrcs: string[] = [];

export function setAssetPaths(paths: {
  stylesheetHref: string;
  clientScriptSrc: string;
  vendorScriptSrcs: string[];
}) {
  stylesheetHref = paths.stylesheetHref;
  clientScriptSrc = paths.clientScriptSrc;
  vendorScriptSrcs = paths.vendorScriptSrcs;
}

export function getStylesheetHref() {
  return stylesheetHref;
}

export function getClientScriptSrc() {
  return clientScriptSrc;
}

/** htmx 본체와 확장. 로드 순서가 의미 있어 배열 순서를 그대로 지킨다. */
export function getVendorScriptSrcs() {
  return vendorScriptSrcs;
}
