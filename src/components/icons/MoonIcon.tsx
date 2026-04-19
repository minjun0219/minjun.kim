import React from "react";

export type Props = Omit<React.SVGAttributes<HTMLOrSVGElement>, "viewBox">;

export const MoonIcon = (props: Props) => (
  <svg {...props} viewBox="0 0 24 24" aria-label="moon">
    <path
      d="M21.64 13a1 1 0 0 0-1.05-.14 8 8 0 0 1-3.37.73 8.15 8.15 0 0 1-8.14-8.1 8 8 0 0 1 .74-3.39 1 1 0 0 0-1.3-1.3A10.14 10.14 0 0 0 2 10.36 10.15 10.15 0 0 0 12.1 20.47a10.14 10.14 0 0 0 9.56-6.37 1 1 0 0 0-.02-1.1z"
    />
  </svg>
);

MoonIcon.displayName = "MoonIcon";

export default MoonIcon;
