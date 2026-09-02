import TopHeading from "@/components/TopHeading";
import type { ClassName } from "@/lib/css";

type Props = {
  className?: ClassName;
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
      {link ? <a href="/">{title}</a> : title}
    </TopHeading>
  );
};

export default Logo;
