import TopHeading from "@/components/TopHeading";
import { PRELOAD_ATTR } from "@/lib/htmx";

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
      {link ? (
        <a href="/" {...PRELOAD_ATTR}>
          {title}
        </a>
      ) : (
        title
      )}
    </TopHeading>
  );
};

export default Logo;
