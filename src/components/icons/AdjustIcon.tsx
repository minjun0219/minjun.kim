import React from "react";

export type Props = Omit<React.SVGAttributes<HTMLOrSVGElement>, "viewBox">;

const AUTO_PATH =
  "M88,100 L123,15 L158,100 M100,70 L146,70 " +
  "M178,15 L178,80 A35,22 0 0 0 248,80 L248,15 " +
  "M268,15 L338,15 M303,15 L303,100 " +
  "M358,57.5 A35,42.5 0 1 0 428,57.5 A35,42.5 0 1 0 358,57.5 Z";

const CIRCLE_PATH = `M409.133,109.203c-19.608-33.592-46.205-60.189-79.798-79.796C295.736,9.801,259.058,0,219.273,0
c-39.781,0-76.47,9.801-110.063,29.407c-33.595,19.604-60.192,46.201-79.8,79.796C9.801,142.8,0,179.489,0,219.267
c0,39.78,9.804,76.463,29.407,110.062c19.607,33.592,46.204,60.189,79.799,79.798c33.597,19.605,70.283,29.407,110.063,29.407
s76.47-9.802,110.065-29.407c33.585-19.602,60.183-46.206,79.795-79.798c19.603-33.596,29.403-70.284,29.403-110.062
C438.533,179.485,428.732,142.795,409.133,109.203z M219.27,374.579c-28.171,0-54.152-6.943-77.943-20.844
c-23.789-13.895-42.633-32.743-56.527-56.527c-13.897-23.791-20.843-49.772-20.843-77.945c0-28.171,6.949-54.152,20.843-77.943
c13.891-23.791,32.738-42.637,56.527-56.531c23.791-13.894,49.772-20.841,77.943-20.841V374.579z`;

export const AdjustIcon = (props: Props) => (
  <svg {...props} viewBox="0 0 438.533 438.533" aria-label="adjust">
    <defs>
      <mask id="adjust-icon-auto-cutout" maskUnits="userSpaceOnUse">
        <rect x="0" y="0" width="438.533" height="438.533" fill="white" />
        <path
          d={AUTO_PATH}
          fill="none"
          stroke="black"
          strokeWidth="56"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </mask>
    </defs>
    <path mask="url(#adjust-icon-auto-cutout)" d={CIRCLE_PATH} />
    <path
      d={AUTO_PATH}
      fill="none"
      stroke="currentColor"
      strokeWidth="32"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

AdjustIcon.displayName = "AdjustIcon";

export default AdjustIcon;
