export type Author = {
  name: string;
  email: string;
};

export type Post = {
  slug: string;
  title: string;
  date: string;
  author: Author;
  content: string;
};
