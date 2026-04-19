import React from "react";

export type Props = Omit<React.SVGAttributes<HTMLOrSVGElement>, "viewBox">;

export const SunIcon = (props: Props) => (
  <svg {...props} viewBox="0 0 24 24" aria-label="sun">
    <path
      d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0-5a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1zm0 17a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1zM2 12a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1zm17 0a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2h-2a1 1 0 0 1-1-1zM4.22 4.22a1 1 0 0 1 1.42 0l1.41 1.41a1 1 0 1 1-1.41 1.42L4.22 5.64a1 1 0 0 1 0-1.42zm12.73 12.73a1 1 0 0 1 1.42 0l1.41 1.41a1 1 0 1 1-1.41 1.42l-1.42-1.41a1 1 0 0 1 0-1.42zM19.78 4.22a1 1 0 0 1 0 1.42l-1.41 1.41a1 1 0 1 1-1.42-1.41l1.41-1.42a1 1 0 0 1 1.42 0zM7.05 16.95a1 1 0 0 1 0 1.42l-1.41 1.41a1 1 0 1 1-1.42-1.41l1.41-1.42a1 1 0 0 1 1.42 0z"
    />
  </svg>
);

SunIcon.displayName = "SunIcon";

export default SunIcon;
