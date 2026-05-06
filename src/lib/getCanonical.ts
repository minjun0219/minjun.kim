import { SITE_URL } from "./siteConfig";

export function getCanonical(path: string) {
  const url = new URL(path, SITE_URL);
  return url.toString();
}

export default getCanonical;
