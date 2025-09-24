import React from "react";
import Link from "next/link";

import TopHeading from "@/components/TopHeading";

type Props = {
  className?: string;
  link?: boolean;
};

const Logo = ({ className, link }: Props) => {
  const title = (
    <>
      minjun<span>.</span>kim
    </>
  );
  return (
    <TopHeading className={className}>
      {link ? <Link href="/">{title}</Link> : title}
    </TopHeading>
  );
};

export default Logo;
