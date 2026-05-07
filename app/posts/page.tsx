import type { Metadata, NextPage } from "next";

import Posts from "@/containers/Posts";

export const metadata: Metadata = {
  title: "Posts",
  alternates: {
    canonical: "/posts",
  },
};

const ArticlesPage: NextPage = () => {
  return <Posts />;
};

export default ArticlesPage;
