import { GITHUB_ICON_PATH, GITHUB_ICON_VIEWBOX } from "./githubIconPath";

export type Props = {
  className?: string;
};

export const GithubIcon = (props: Props) => (
  <svg {...props} viewBox={GITHUB_ICON_VIEWBOX} aria-label="github">
    <path d={GITHUB_ICON_PATH} fill="currentColor" fillRule="nonzero" />
  </svg>
);

GithubIcon.displayName = "GithubIcon";

export default GithubIcon;
